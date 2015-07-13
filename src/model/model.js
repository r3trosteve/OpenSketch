module.exports = {
  '/home': {
    'template': 'template file'
  },
  '/whiteboard': {
    'template': 'template file'
  },
  'socketEvents':{
    // Announcements/Messages
    'chatMessage': 'chatMessage',
    'announcement': 'announcement',

    // User Joining/Leaving Events
    'updateUserList': 'updateUserList',
    'updateChatList': 'updateChatList',
    'userLeft': 'userLeft',

    // Session Creation/Validation Events
    'getSocketID': 'getSocketID',
    'joinSession': 'joinSession',
    'validateSession': 'validateSession',
    'createSession': 'createSession',
    'badSession': 'badSession',

    // Pixi/Canvas Draw Events
    'shapeEvent':'shapeEvent',
    'saveObject' : 'saveObject',
    'populateCanvas' : 'populateCanvas',


    'sendDrawing': 'sendDrawing',
    'sendPencil' : 'sendPencil',
    // 'sendLine' : 'sendLine'
  }
};
