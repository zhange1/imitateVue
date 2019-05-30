class ZVue{
  constructor(options){
    this.$options = options

    this.$data = options.data
    this.observe(this.$data)//观察函数监听函数

    //模拟一下watcher的创建过程
    // new Watcher()
    // this.$data.test;
    // new Watcher()
    // this.$data.foo.bar;

    new Compiles(options.el,this)
    //执行created
    if(options.created){
      options.created.call(this)
    }
  }
  observe(data){
    if(!data || typeof(data) !== 'object'){
      return;
    }
    //遍历该对象
    Object.keys(data).forEach(key=>{
      this.defineReactive(data,key,data[key])//定义响应化
      //代理data中的属性到vue实例上
      this.prpxyData(key)
    })
  }  

  //数据响应化
  defineReactive(data,key,val){
    this.observe(val)//递归 解决数据的层级嵌套
    
    const dep = new Dep();

    Object.defineProperty(data,key,{
      get(){
        Dep.target && dep.addDep(Dep.target)
        return val;
      },
      set(newVal){
        if(newVal == val){
          return;
        }
        val = newVal;
        // console.log(`${key}属性更新了：${val}`)
        dep.notify()
      }
    })
  }
  prpxyData(key){
    Object.defineProperty(this,key,{
      get(){
        return this.$data[key]
      },
      set(newVal){
        this.$data[key] = newVal
      }
    })
  }
}


//Dep:用来管理 Watcher

class Dep{
  static target = null;
  constructor(){
    this.deps = [];//这里存放的是依赖(watcher) 一个属性一个watcher
  }
  addDep(dep){
    this.deps.push(dep)
  }
  //通知所有依赖进行更新
  notify(){
    this.deps.forEach(dep=>{
      dep.update()
    })
  }
}

  //观察者 Watcher

class Watcher{
  constructor(vm,key,cb){
    this.vm = vm
    this.key = key
    this.cb = cb
    //将当前watcher的实例指定到dep的静态属性target
    Dep.target = this
    this.vm[this.key] //触发相对应的getter,添加依赖
    Dep.target = null //置空 避免重复添加
  }

  update(){
    // console.log('属性更新了')
    this.cb.call(this.vm,this.vm[this.key])
  }
}