const fs = require('fs');
const io = {
  buffer: '',
  input() {
    return fs.readFileSync('/dev/stdin').toString().trim().split('\n');
  },
  insert(s) {
    this.buffer += s;
  },
  output() {
    console.log(this.buffer);
  }
};

/*
ENUM
*/
const OBJECT_TYPE = {
  EMPTY: 0,
  HERO: 1,
  WALL: 2,
  ITEMBOX: 3,
  TRAP: 4,
  MONSTER: 5,
  BOSS: 6, // initMap에서만 사용
}

const MAP_SIMBOL = {
  EMPTY: '.',
  HERO: '@',
  WALL: '#',
  ITEMBOX: 'B',
  TRAP: '^',
  MONSTER: '&',
  BOSS: 'M',
}

const HERO_STATE = {
  DEAD: -1,
};

const ACC_TYPE = {
  HR: 1, // 전투에서 승리할 때마다 체력을 3 회복한다. 체력은 최대 체력 수치까지만 회복된다.
  RE: 2, // 주인공이 사망했을 때 소멸하며, 주인공을 최대 체력으로 부활시켜 준 뒤, 주인공을 첫 시작 위치로 돌려보낸다. 전투 중이던 몬스터가 있다면 해당 몬스터의 체력도 최대치로 회복된다.
  CO: 3, // 모든 전투에서, 첫 번째 공격에서 주인공의 공격력(무기 합산)이 두 배로 적용된다. 즉, 모든 첫 공격에서 몬스터에게 max(1, 공격력×2 – 몬스터의 방어력)만큼의 데미지를 입힌다.
  EX: 4, // 얻는 경험치가 1.2배가 된다. 소수점 아래는 버린다.
  DX: 5, // 가시 함정에 입는 데미지가 1로 고정되며, Courage 장신구와 함께 착용할 경우, Courage의 공격력 효과가 두 배로 적용되는 대신 세 배로 적용된다.
  HU: 6, // 보스 몬스터와 전투에 돌입하는 순간 체력을 최대치까지 회복하고, 보스 몬스터의 첫 공격에 0의 데미지를 입는다.
  CU: 7, // 아무 능력이 없으며, 그냥 장신구 한 자리를 차지한다.
};

const ITEM_TYPE = {
  EMPTY: 0,
  WEAPON: 1,
  ARMOR: 2,
  ACC: 3,
}

const MONSTER_TYPE = {
  NORMAL: 0,
  BOSS: 1,
}

/*
CLASS
*/
class GameObject {
  constructor(x = 0, y = 0, content = null, type = OBJECT_TYPE.EMPTY) {
    this.x = x;
    this.y = y;
    this.content = content;
    this.type = type;
  }
}

class Hero {
  constructor(level = 1, exp = 0, hp = 20, maxHp = 20, baseAtt = 2, baseDef = 2, weapon = new Weapon(), armor = new Armor(), acc = []) {
    this.level = level;
    this.exp = exp;
    this.hp = hp;
    this.maxHp = maxHp;
    this.baseAtt = baseAtt;
    this.baseDef = baseDef;
    this.weapon = weapon;
    this.armor = armor;
    this.acc = acc;
  }
  maxExp() {
    return this.level * 5;
  }
  addExp(exp) {
    this.exp = this.exp + exp;
    if (this.exp >= this.maxExp()) {
      this.exp = 0
      this.level = this.level + 1;
      this.maxHp = this.maxHp + 5;
      this.baseAtt = this.baseAtt + 2;
      this.baseDef = this.baseDef + 2;
      this.hp = this.maxHp;
    }
  }
  addHp(hp) {
    let tHp = this.hp + hp;
    if (tHp > this.maxHp) {
      this.hp = this.maxHp;
    } else {
      this.hp = tHp;
    }
  }
  subHp(hp) {
    let tHp = this.hp - hp;
    if (tHp <= 0) {
      this.hp = 0;
      return HERO_STATE.DEAD;
    } else {
      this.hp = tHp;
    }
  }
  equipWeapon(weapon) {
    this.weapon = weapon;
  }
  equipArmor(armor) {
    this.armor = armor;
  }
  isEquipedAcc(type) {
    for(let i = 0; i < this.acc.length; ++i) {
      if (this.acc[i].type === type) {
        return true;
      }
    }
    return false;
  }
  equipAcc(acc) {
    if (this.acc.length >= 4) {
      return false;
    }
    if (this.isEquipedAcc(acc.type)) {
      return false;
    }
    this.acc.push(acc);
    return true;
  }
  unequipAcc(type) {
    for(let i = 0; i < this.acc.length; ++i) {
      if (this.acc[i].type === type) {
        this.acc = [...this.acc.slice(0, i), ...this.acc.slice(i + 1)];
        return true;
      }
    }
    return false;
  }
  getAtt() {
    return this.baseAtt + this.weapon.att;
  }
  getDef() {
    return this.baseDef + this.armor.def;
  }
}

class Weapon {
  constructor(att = 0) {
    this.att = att;
  }
}

class Armor {
  constructor(def = 0) {
    this.def = def;
  }
}

class Acc {
  constructor(type = ACC_TYPE.CU) {
    this.type = type;
  }
}

class Itembox {
  constructor(type = ITEM_TYPE.EMPTY, item = null) {
    this.type = type;
    this.item = item;
  }
}

class Monster {
  constructor(type = MONSTER_TYPE.NORMAL, name = '', att = 0, def = 0, hp = 0, exp = 0) {
    this.type = type;
    this.name = name;
    this.att = att;
    this.def = def;
    this.hp = hp;
    this.maxHp = hp;
    this.exp = exp;
  }
  subHp(hp) {
    let tHp = this.hp - hp;
    if (tHp <= 0) {
      this.hp = 0;
      return HERO_STATE.DEAD;
    } else {
      this.hp = tHp;
    }
  }
}

/*
GAME
*/
let mapsize = { weight: 0, height: 0 };
let mapOverview = [[], ];
let turn = 0;
let movements = '';
let isOver = false;
let overMessage = 'Press any key to continue.';
let hero = new GameObject(0, 0, new Hero(), OBJECT_TYPE.HERO);
let entryPosition = { x: 0, y: 0 };
let itemboxs = [];
let monsters = [];

function findItembox(x, y) {
  for (let i = 0; i < itemboxs.length; ++i) {
    if (itemboxs[i].x === x && itemboxs[i].y === y) {
      return i;
    }
  }
  return -1;
}

function findMonster(x, y) {
  for (let i = 0; i < monsters.length; ++i) {
    if (monsters[i].x === x && monsters[i].y === y) {
      return i;
    }
  }
  return -1;
}

function initMap() {
  let ioInput = io.input();
  mapsize.height = parseInt(ioInput[0].split(' ')[0]);
  mapsize.weight = parseInt(ioInput[0].split(' ')[1]);
  for (let i = 1; i <= mapsize.height; ++i) {
    mapOverview.push([]);
    let splited = ioInput[i].split('');
    mapOverview[i].push(OBJECT_TYPE.EMPTY);
    for (let j = 0; j <= splited.length; ++j) {
      switch (splited[j]) {
        case MAP_SIMBOL.EMPTY:
          mapOverview[i].push(OBJECT_TYPE.EMPTY);
          break;
        case MAP_SIMBOL.HERO:
          mapOverview[i].push(OBJECT_TYPE.EMPTY);
          hero.x = j + 1;
          hero.y = i;
          entryPosition = { x: hero.x, y: hero.y };
          break;
        case MAP_SIMBOL.WALL:
          mapOverview[i].push(OBJECT_TYPE.WALL);
          break;
        case MAP_SIMBOL.ITEMBOX:
          mapOverview[i].push(OBJECT_TYPE.ITEMBOX);
          break;
        case MAP_SIMBOL.TRAP:
          mapOverview[i].push(OBJECT_TYPE.TRAP);
          break;
        case MAP_SIMBOL.MONSTER:
          mapOverview[i].push(OBJECT_TYPE.MONSTER);
          break;
        case MAP_SIMBOL.BOSS:
          mapOverview[i].push(OBJECT_TYPE.BOSS);
          break;
      }
    }
  }
  movements = ioInput[mapsize.height + 1];
  for (let i = mapsize.height + 2; i < ioInput.length; ++i) {
    let splited = ioInput[i].split(' ');
    let y = parseInt(splited[0]);
    let x = parseInt(splited[1]);
    switch (mapOverview[y][x]) {
      case OBJECT_TYPE.ITEMBOX:
        let kind = splited[2];
        switch (kind) {
          case 'W':
            let weapon = new Weapon(parseInt(splited[3]));
            itemboxs.push(new GameObject(x, y, new Itembox(ITEM_TYPE.WEAPON, weapon), OBJECT_TYPE.ITEMBOX));
            break;
          case 'A':
            let armor = new Armor(parseInt(splited[3]));
            itemboxs.push(new GameObject(x, y, new Itembox(ITEM_TYPE.ARMOR, armor), OBJECT_TYPE.ITEMBOX));
            break;
          case 'O':
            let acc = new Acc(ACC_TYPE[splited[3]]);
            itemboxs.push(new GameObject(x, y, new Itembox(ITEM_TYPE.ACC, acc), OBJECT_TYPE.ITEMBOX));
            break;
        }
        break;
      case OBJECT_TYPE.MONSTER:
        monsters.push(new GameObject(x, y, new Monster(
          MONSTER_TYPE.NORMAL, splited[2], parseInt(splited[3]), parseInt(splited[4]), parseInt(splited[5]), parseInt(splited[6])
        ), OBJECT_TYPE.MONSTER));
        break;
      case OBJECT_TYPE.BOSS:
        monsters.push(new GameObject(x, y, new Monster(
          MONSTER_TYPE.BOSS, splited[2], parseInt(splited[3]), parseInt(splited[4]), parseInt(splited[5]), parseInt(splited[6])
        ), OBJECT_TYPE.MONSTER));
        mapOverview[y][x] = OBJECT_TYPE.MONSTER;
        break;
    }
  }
}

function dieHero(monster = null) {
  if (hero.content.isEquipedAcc(ACC_TYPE.RE)) {
    hero.content.unequipAcc(ACC_TYPE.RE);
    hero.content.hp = hero.content.maxHp;
    hero.x = entryPosition.x;
    hero.y = entryPosition.y;
    if (monster !== null) {
      monster.content.hp = monster.content.maxHp;
    }
    return false;
  } else {
    hero.x = -1;
    hero.y = -1;
    return true;
  }
}

function dieMonster(monster) {
  let index = findMonster(monster.x, monster.y);
  let exp = monster.content.exp;
  if (hero.content.isEquipedAcc(ACC_TYPE.EX)) {
    exp = Math.floor(exp * 1.2);
  }
  hero.content.addExp(exp);
  mapOverview[monster.y][monster.x] = OBJECT_TYPE.EMPTY;
  monsters = [...monsters.slice(0, index), ...monsters.slice(index + 1)];
}

function inTrap() {
  let sub = 5;
  if (hero.content.isEquipedAcc(ACC_TYPE.DX)) {
    sub = 1;
  }
  if (hero.content.subHp(sub) === HERO_STATE.DEAD) {
    if (dieHero()) {
      overMessage = 'YOU HAVE BEEN KILLED BY SPIKE TRAP..';
      isOver = true;
    }
  }
}

function openItembox(index) {
  let itembox = itemboxs[index];
  switch (itembox.content.type) {
    case ITEM_TYPE.WEAPON:
      hero.content.equipWeapon(itembox.content.item);
      break;
    case ITEM_TYPE.ARMOR:
      hero.content.equipArmor(itembox.content.item);
      break;
    case ITEM_TYPE.ACC:
      hero.content.equipAcc(itembox.content.item);
      break;
  }
  mapOverview[itembox.y][itembox.x] = OBJECT_TYPE.EMPTY;
  itemboxs = [...itemboxs.slice(0, index), ...itemboxs.slice(index + 1)];
}

function battle(index) {
  let monster = monsters[index];
  let count = 0;
  if (monster.content.type === MONSTER_TYPE.BOSS && hero.content.isEquipedAcc(ACC_TYPE.HU)) {
    hero.content.hp = hero.content.maxHp;
  }
  while (true) {
    ++count;
    let monsterDamage = hero.content.getAtt();
    if (count === 1 && hero.content.isEquipedAcc(ACC_TYPE.CO)) {
      monsterDamage = monsterDamage * 2;
      if (hero.content.isEquipedAcc(ACC_TYPE.DX)) {
        monsterDamage = monsterDamage * 1.5;
      }
    }
    monsterDamage = monsterDamage - monster.content.def;
    if (monsterDamage < 1) {
      monsterDamage = 1;
    }
    if (monster.content.subHp(monsterDamage) === HERO_STATE.DEAD) {
      if (monster.content.type === MONSTER_TYPE.BOSS) {
        overMessage = 'YOU WIN!';
        isOver = true;
      }
      dieMonster(monster);
      if (hero.content.isEquipedAcc(ACC_TYPE.HR)) {
        hero.content.addHp(3);
      }
      break;
    }
    if (count === 1 && hero.content.isEquipedAcc(ACC_TYPE.HU)) {
      continue;
    }
    let heroDamage = monster.content.att - hero.content.getDef();
    if (heroDamage < 1) {
      heroDamage = 1;
    }
    if (hero.content.subHp(heroDamage) === HERO_STATE.DEAD) {
      if (dieHero()) {
        overMessage = `YOU HAVE BEEN KILLED BY ${monster.content.name}..`;
        isOver = true;
      }
      break;
    }
  }
}

function interpret() {
  for (let i = 0; i < movements.length; ++i) {
    ++turn;
    let from = { x: hero.x, y: hero.y };
    let move = movements[i];
    switch (move) {
      case 'U': 
        if (hero.y !== 1) {
          hero.y -= 1;
        }
        break;
      case 'D':
        if (hero.y !== mapsize.height) {
          hero.y += 1;
        }
        break;
      case 'L':
        if (hero.x !== 1) {
          hero.x -= 1;
        }
        break;
      case 'R':
        if (hero.x !== mapsize.weight) {
          hero.x += 1;
        }
        break;
    }
    if (mapOverview[hero.y][hero.x] === OBJECT_TYPE.WALL) {
      hero.x = from.x;
      hero.y = from.y;
    }
    switch (mapOverview[hero.y][hero.x]) {
      case OBJECT_TYPE.TRAP:
        inTrap();
        break;
      case OBJECT_TYPE.ITEMBOX:
        openItembox(findItembox(hero.x, hero.y));
        break;
      case OBJECT_TYPE.MONSTER:
        battle(findMonster(hero.x, hero.y));
        break;
    }
    if (isOver) {
      break;
    }
  }
  for (let y = 1; y <= mapsize.height; ++y) {
    for (let x = 1; x <= mapsize.weight; ++x) {
      if (x === hero.x && y === hero.y) {
        io.insert(MAP_SIMBOL.HERO);
        continue;
      }
      switch (mapOverview[y][x]) {
        case OBJECT_TYPE.EMPTY:
          io.insert(MAP_SIMBOL.EMPTY);
          break;
        case OBJECT_TYPE.WALL:
          io.insert(MAP_SIMBOL.WALL);
          break;
        case OBJECT_TYPE.ITEMBOX:
          io.insert(MAP_SIMBOL.ITEMBOX);
          break;
        case OBJECT_TYPE.TRAP:
          io.insert(MAP_SIMBOL.TRAP);
          break;
        case OBJECT_TYPE.MONSTER:
          if (monsters[findMonster(x, y)].content.type === MONSTER_TYPE.BOSS) {
            io.insert(MAP_SIMBOL.BOSS);
          } else {
            io.insert(MAP_SIMBOL.MONSTER);
          }
          break;
      }
    }
    io.insert('\n');
  }
  io.insert(`Passed Turns : ${turn}\n`);
  io.insert(`LV : ${hero.content.level}\n`);
  io.insert(`HP : ${hero.content.hp}/${hero.content.maxHp}\n`);
  io.insert(`ATT : ${hero.content.baseAtt}+${hero.content.weapon.att}\n`);
  io.insert(`DEF : ${hero.content.baseDef}+${hero.content.armor.def}\n`);
  io.insert(`EXP : ${hero.content.exp}/${hero.content.maxExp()}\n`);
  io.insert(overMessage);
  io.output();
}

initMap();
interpret();