//用法 new Compiles(el,vm)
class Compiles{
  constructor(el,vm){//当前元素  当前vue实例
    this.$el = document.querySelector(el)

    this.$vm = vm

    //编译
    if(this.$el){
      //将内容转换为片段 fragment
      this.$fragment = this.node2Fragment(this.$el)
      //编译
      this.compile(this.$fragment)
      // 将编译完成的html结果追加到$el
      this.$el.appendChild(this.$fragment)
    }
  }
  //将诉诸元素中代码片段拿出遍历，这样比较搞笑
  node2Fragment(el){
    const frag = document.createDocumentFragment()
    //将el中所有子元素搬家至frag中
    let child
    while(child = el.firstChild){
      frag.appendChild(child)
    }
    return frag
  }
  compile(el){
    const childNodes = el.childNodes
    Array.from(childNodes).forEach(node=>{
      //类型判断
      if(this.isElement(node)){
        //元素
        // console.log('编译元素',node.nodeName)
        //查找 z- @ :
        const nodeAttrs = node.attributes
        Array.from(nodeAttrs).forEach(attr=>{
          const attrName = attr.name//属性名
          const exp = attr.value//属性值
          if(this.isDirective(attrName)){
            // console.log(attrName)
            const dir = attrName.substring(2)
            //普通指令
            this[dir] && this[dir](node,this.$vm,exp)
          }
          if(this.isEvent(attrName)){
            const dir = attrName.substring(1)
            this.eventHandler(node,this.$vm,exp,dir)
          }
        })
      }else if(this.isInterpolation(node)){
        //插值
        // console.log('编译文本',node.textContent)
        this.compileText(node)
      }
      //递归
      if(node.childNodes && node.childNodes.length>0){
        this.compile(node)
      }
    })
  }
  compileText(node){
    // console.log(RegExp.$1)
    this.update(node,this.$vm,RegExp.$1,'text')
  }
  //更新函数
  update(node,vm,exp,dir){
    const updateFn = this[dir+'Updater']
    // console.log(updateFn)
    //初始化
    updateFn && updateFn(node,vm[exp])
    //依赖收集的具体实现
    new Watcher(vm,exp,function(val){
      updateFn && updateFn(node,val)
    })
  }
  text(node,vm,exp){
    this.update(node,vm,exp,'text')
  }
  html(node,vm,exp){
    this.update(node,vm,exp,'html')
  }
  //双向数据绑定
  model(node,vm,exp){
    //指定input的value属性
    this.update(node,vm,exp,'model')
    
    //识图对于模型的响应
    node.addEventListener('input',e=>{
      vm[exp] = e.target.value
    })
  }
  modelUpdater(node,value){
    node.value = value
  }
  eventHandler(node,vm,exp,dir){
    let fn = vm.$options.methods && vm.$options.methods[exp]
    if(dir && fn){
      node.addEventListener(dir,fn.bind(vm))
    }
  }
  htmlUpdater(node,value){
    node.innerHTML = value
  }
  textUpdater(node,val){
    node.textContent = val
  }
  isDirective(name){
    return name.indexOf('z-') == 0
  }
  isEvent(name){
    return  name.indexOf('@') == 0
  }
  isElement(node){
    return node.nodeType === 1
  }
  isInterpolation(node){
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }

}