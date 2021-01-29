//引入mockjs
const Mock = require('mockjs')
//使用mockjs模拟数据
Mock.mock('/mock', {
  "story|30": [
    {
      "id|+1": 1,
      "title": "@word(8)",
      "liveNum|1-100": 100,
      "notice|1-200": 200,
    }
  ],
  errorCode:'0x0'
})

Mock.mock('/journalist', {
  "list|16": [
    {
      "id|+1": 1,
      "sourceName": "@word(8)",
      "status": "@pick([1,2])",
      "position": "@city",
      "liveTime": "@time"
    }
  ],
  errorCode:'0x0'
})

Mock.mock('/chatRoom', {
  "list": [
    {
      id: '1',
      nickName: 'sunny',
      time: '09:23 AM',
      chatBody: ['hellohellohellohellohellohellohellohellohellohellohellohellohellohellohe llohellohellohello!','what it is']
    },
    {
      id: '2',
      nickName: 'summer',
      time: '09:23 AM',
      chatBody: ['hello!','what it is what it iswhat it iswhat it iswhat it iswhat it iswhat it iswhat it iswhat it iswhat it iswhat it iswhat it iswhat it iswhat it is']
    },
    {
      id: '3',
      nickName: 'thomas',
      time: '09:23 AM',
      chatBody: ['hello!hello!','what it is']
    },
    {
      id: '4',
      nickName: 'henny',
      time: '09:23 AM',
      chatBody: ['hello!','what it is','hahahaha']
    }
  ],
  errorCode:'0x0'
})