var connectionTimeout = 6000;
class User {
  constructor(id) {
    this.id = id;
    this.stage = "lobby";
    this.isTurn = false;
    this.timeOut = connectionTimeout;
    this.picks = fillHeroes();
    this.bans = fillHeroes();
  }
  update() {
    this.timeOut = connectionTimeout;
  }
}

class EmptyHero {
  constructor(id) {
    this.name = "empty";
    this.isPickTime = false;
  }
}
var fillHeroes = () => {
  var arr = [];
  for (var index = 0; index < 5; index++) {
    arr.push(new EmptyHero());
  }
  return arr;
}

class Room {
  constructor() {
    this.id = Math.random().toString(36).substring(7);
    this.users = [null, null];
    this.currOrder = 0;
  }
  Create(id) {
    this.users[0] = new User(id);
  }
  Join(id) {
    this.users[1] = new User(id);
  }
  ChooseHero(pId, hid) {
    this.currOrder++;
    var resp = {
      currOrder: this.currOrder,
      pId: pId,
      hId: hid
    }
    return resp;
  }
  Leave(id) {
    room.users[0] = null
  }
}

exports.Room = Room;
