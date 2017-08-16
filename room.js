var connectionTimeout = 6000;
class User {
  constructor(id, order) {
    this.id = id;
    this.order = order;
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
    this.user1;
    this.user2;
    this.users = [null, null];
    this.currOrder = 0;
  }
  Create(id) {
    this.user1 = new User(id, 1);
    this.users[0] = this.user1;
  }
  Join(id) {
    this.user2 = new User(id, 2);
    this.users[1] = this.user2;
  }
  Start() {
    this.user1.stage = "draft";
    this.user2.stage = "draft";
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
}

exports.Room = Room;
