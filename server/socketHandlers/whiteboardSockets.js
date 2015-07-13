var Session = require('../db/models/Session');

var ShapeManager = require('../db/DbManagers/CanvasShapesManager');
var EVENT = require('../../src/model/model').socketEvents;
var whiteboardSockets = {};

//JOIN
whiteboardSockets.joinSessionCB = function(socket,nsp) {
  return function(uName,sessionid) {
        //validate name
        console.log('joinsession');
        // FOR TESTING AND DEVELOPMENT
        if(sessionid === 'session41') {
          console.log('Development session Enabled');
          return;
        }

        Session.findById(sessionid, function(err, session){
          if(err){
            console.warn('Error Retrieving Session: at ', new Date.toUTCString(), ' recieved sessionId: ', sessionid, ' retreieved ', session);
            //throw new Error('Error retrieving Session');
          }
          else if(session && session._id) {
            //push user to db
            if(session.users.length < session.sessionProperties.maxUsers){
              session.users.push({
                username: uName,
                userRank: session.users.length,
                canDraw: session.canDraw,
                canChat: session.canChat,
                _id: socket.id
              });

              session.save(function(err){
                 if(err) console.log(err);
                 else {
                   console.log(session);
                   socket.broadcast.emit(EVENT.announcement, uName + ' has joined the session');
                   socket.broadcast.emit(EVENT.updateUserList, session.users.length+'/' + session.sessionProperties.maxUsers, session.users);

                   socket.emit(EVENT.updateUserList, session.users.length+'/' + session.sessionProperties.maxUsers, session.users, session.users.length - 1);

                   socket.emit(EVENT.updateChatList, session.messages);

                   //socket.emit(EVENT.populateCanvas,session.canvasShapes);

                   // Should just emit as one object,
                   // addNewParticipant
                   // var sessionData = {
                   //  currentUser: userId,
                   //  users: [],
                   //  messages: [],
                   //  shapes: [],
                   //  defaults: {}
                   // };
                   /**


                    */
                 }
              });
            }
          }
          else {
            console.warn('Null Sesson returned, Date: ', new Date.toUTCString(), ' recieved sessionId: ', sessionid, ' retreieved ', session);
          }
        });
  };
};
//CHAT
whiteboardSockets.chatMessageCB = function(socket,nsp){
 return function(message) {
        //socket emit chat to other users
        var sessionid = socket.adapter.nsp.name.split('/');
        sessionid = sessionid[sessionid.length - 1];

        Session.findById(sessionid, function(err, session){
          if(err){
            throw new Error('Error retrieving Session');
          }
          else if(session._id){
            //push user to db

            if(session.users.length < session.sessionProperties.maxUsers){
              session.messages.push({
                userID : socket.id,
                user: message.user,
                msg: message.msg
              });
              session.save(function(err){
                 if(err) console.log(err);
                 else{
                   console.log('saved msg');

                 }
              });
           }
          }
        });
         socket.broadcast.emit(EVENT.chatMessage, {
               'user': message.user,
               'msg': message.msg
              });


        console.log('msg received', message);
        //add chat to db //but maybe we don't need to keep chat messages stored?

      };

};
//DISCONNECT
whiteboardSockets.disconnectCB = function(socket,nspWb){
  return function() {
    sessionid = socket.adapter.nsp.name.split('/');
    sessionid = sessionid[sessionid.length - 1];
    console.log('disconn ',socket.id);
    //remove user from db
    Session.findById(sessionid, function(err,session){
      if(err){
        console.log('error');
      } else if(session) {
        //delete user
       var removedUser;
       if(session.users){
         if(session.users.id(socket.id)!=null){
           removedUser = session.users.id(socket.id);
           session.users.id(socket.id).remove();
         }
       }
       if(removedUser != undefined){
         socket.broadcast.emit(EVENT.announcement, removedUser.username + ' has left the session');

         socket.broadcast.emit(EVENT.updateUserList, session.users.length+'/'+session.sessionProperties.maxUsers, session.users);
         socket.broadcast.emit(EVENT.userLeft, removedUser.id);

         socket.emit(EVENT.updateUserList, session.users.length+'/'+session.sessionProperties.maxUsers, session.users);
         socket.emit(EVENT.userLeft, removedUser);
       }
       session.save(function(err){
           if(err) console.log(err);
           else console.log(session);
        });
      }
    });
  };
};

//DRAW
whiteboardSockets.sendPencilCB = function(socket,nspWb){
  return function(info){
    console.log('draw pencil received');
    //add drawing to db
    //emit drawing to other users
    socket.broadcast.emit(EVENT.sendPencil, info);
  };
};

whiteboardSockets.shapeObjectCB = function(socket, nspWb) {
  console.log('send Rect socket connected');

  return function(eventType, data) {
    console.log('recieved socket shape event');
    console.log(eventType);
    console.log(data);

    socket.broadcast.emit(EVENT.shapeEvent, eventType, data);
  }
}

whiteboardSockets.saveObjectCB = function(socket, nspWb) {
  return function(data) {
    console.log('recieved socket ssave event');
    console.log(data);
    var sessionid = socket.adapter.nsp.name.split('/');
    sessionid = sessionid[sessionid.length - 1];
    ShapeManager.findOne(sessionid,data._id,function(err,result){
      if(result){
        if(result.canvasShapes.length > 0){
          var newObj = result.canvasShapes[0];
          for(var prop in data){
           newObj[prop] = data[prop];
          }
          console.log('newobj: ',newObj);
          ShapeManager.updateOne(sessionid,data._id,newObj,function(){})
        }else{
          ShapeManager.addOne(sessionid,data,function(){});
        }
      }

    });
  };
}



module.exports = whiteboardSockets;
