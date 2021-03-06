function logt(msg,stylestr=""){
  console.log("%c" + msg,"color:#009999;font-size:2em;"+stylestr)
}
function logOk(msg){
  console.log("%c"+msg,"color:#000066;font-size:3em;")
}
function testspec(str,fn,stylestr){
  logt(str,stylestr)
  fn()
}
let testspecObj = {
  "<anyChar> testing" () {
    let r1 = parse(anyChar,"hello")
    console.assert(r1 == "h")
    let r2 = parse(anyChar,"")
    console.assert(r2.type == "error")
    function* char3 () {
      let a = yield anyChar
      let b = yield anyChar
      let c = yield anyChar
      return a + b + c
    }
    let r3 = parse(char3,"123")
    console.assert(r3 == "123")
  },
  "<char> testing" () {
    let r1 = parse(char('h'),'hello')
    console.assert(r1 == 'h')
    let r11 = parse(char('l'),'hello')
    console.assert(r11.type == 'error')
    function* char2(){
      let h = yield char('h')
      yield anyChar
      let l = yield char('l')
      return h + l
    }
    let r2 = parse(char2,'hello')
    console.assert(r2 == 'hl')
  },
  "<string> testing" () {
    let r3 = parse(string("hello"),"hello")
    console.assert(r3 == "hello")
    let r4 = parse(string("hello"),"hell0")
    console.assert(r4.actual == "hell0")
  },
  "<many> <many1> testing" () {
    let r5 = parse(many(string("hi")),"hihihi000")
    console.assert(r5.join(',') == "hi,hi,hi")
    let r6 = parse(function*(){
      let hi = yield many(string("hi"))
      let z = yield many(char('0'))
      return hi.join('')+z.join('')
    },"hihihi000")
    console.assert(r6 == "hihihi000")
    function* many1p(){
      let h = yield many1(char('h'))
      return h
    }
    let r7 = parse(many1p,"000")
    console.assert(r7.type == 'error')
    let r8 = parse(many1p,"hhh000")
    console.assert(r8.join('') === 'hhh')
  },
  "<anys> testing" () {
    function* diqyeOrDIQYE(){
      return yield anys([string('diqye'),string('DIQYE')])
    }
    let r = parse(diqyeOrDIQYE,'diqye')
    console.assert(r === 'diqye')
    let r1 = parse(diqyeOrDIQYE,'DIQYE')
    console.assert(r1 === 'DIQYE')
    let err = parse(diqyeOrDIQYE,'ho')
    console.assert(err.type === 'error')
  },
  "<spaces> testing" () {
    function* ytest(){
      yield spaces
      yield string('who am i')
      return true
    }
    let r = parse(ytest,'who am i')
    console.assert(r === true)
    let r1 = parse(ytest,`
         
      who am i`)
    console.assert(r === true)
  },
  "<lookAhead> testing" () {
    function* lookAheadTest(){
      let a = yield lookAhead(string('hello'))
      let b = yield string('hello')
      return a + b
    }
    let r = parse(lookAheadTest,'hello')
    console.assert(r === 'hellohello')
  },
  "<manyTill>" () {
    function* mt(){
      let a = yield manyTill(anyChar)(string(' end'))
      return a.join('')
    }
    let r = parse(mt,'ni hao end')
    console.assert(r==='ni hao')
  },
  "<notFollowedBy> <eof>" () {
    let r = parse(eof,'')
    console.assert(r===null)
    function* parser(){
      yield string('let')
      yield many1(char(' '))
      yield notFollowedBy(string('aa'))
      let name = yield manyTill(anyChar)(space)
      return name.join('')
    }
    let r1 = parse(parser,'let bbaa = 2')
    console.assert(r1 == 'bbaa')
    let r2 = parse(parser,'let aa = 2')
    console.assert(r2.type === 'error')
  },
  "<stepBy> <stepBy1> <final>" () {
    function* parser(){
      let r =  yield stepBy1(anyChar)(char(','))
      return r.join('')
    }
    let r = parse(parser,'a,b,c,d')
    console.assert(r==='abcd')
    let r1 = parse(anys([parser,final('hello')]),'')
    console.assert(r1==='hello')
    function* parser1(){
      let r =  yield stepBy(anyChar)(char(','))
      return r.join('')
    }
    let r2 = parse(parser1,'')
    console.assert(r2==='')
  }
}
function test() {
  testspec('Basic testing',()=>{
    let runYieldSync = withContext({name:"test",age:10})
    console.assert(runYieldSync("hello") == "hello")
    function* yge() {
      return "yge"
    }
    console.assert(runYieldSync(yge) == "yge")
    console.assert(runYieldSync(yge()) == "yge")
    function* yge2() {
      let a = yield yge
      let b = yield yge()
      return a + " " + b
    }
    console.assert(runYieldSync(yge2) == "yge yge")
    function cusum (ctx) {
      return [ctx.name,{name:"diqye"}]
    }
    console.assert(runYieldSync(cusum) == "test")
    function* cusum2 () {
      let a = yield cusum
      let b = yield function* () { return yield cusum }
      return a + b
    }
    console.assert(runYieldSync(cusum2) == "diqyediqye")

  })
  testspec('Error testing',()=>{
    function error(ctx){
      return "I am a error"
    }
    function* errorTest() {
      let a = yield error
      throw "我不会被执行"
      return "hello"
    }
    let runY1 = withContext("hello")
    console.assert(runY1(error) == "I am a error")
    let runY = withContext("hello")
    console.assert(runY(errorTest) == "I am a error")
  })
  testspec('Parsec testing',()=>{
    for(let key in testspecObj){
      testspec(key, testspecObj[key],"font-size:1.5em;")
    }
  })
  logOk("All the tests were successful")
}
