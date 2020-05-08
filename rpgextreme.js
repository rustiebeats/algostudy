const fs = require('fs');

const io = {
  buffer: '',
  input() {
    return fs.readFileSync('/dev/stdin').toString().split(' ');
  },
  insert(s) {
    this.buffer += s;
  },
  output() {
    console.log(this.buffer);
  }
};

class Object {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

const HERO_DEAD = -1;
class Hero {
  constructor(level = 1, exp = 0, hp = 20, maxHp = 20, baseAtt = 2, baseDef = 2, weapon = [], armor = [], acc = []) {
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
    while (this.exp >= this.maxExp()) {
      this.exp -= this.maxExp();
      this.level = this.level + 1;
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
      return -1;
    } else {
      this.hp = tHp;
    }
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
    // TODO
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
}

class Weapon {
  constructor(att) {
    this.att = att;
  }
}

class Armor {
  constructor(def) {
    this.def = def;
  }
}

const ACC_TYPE = {
  HR: 1, // 전투에서 승리할 때마다 체력을 3 회복한다. 체력은 최대 체력 수치까지만 회복된다.
  RE: 2, // 주인공이 사망했을 때 소멸하며, 주인공을 최대 체력으로 부활시켜 준 뒤, 주인공을 첫 시작 위치로 돌려보낸다. 전투 중이던 몬스터가 있다면 해당 몬스터의 체력도 최대치로 회복된다.
  CO: 3, // 모든 전투에서, 첫 번째 공격에서 주인공의 공격력(무기 합산)이 두 배로 적용된다. 즉, 모든 첫 공격에서 몬스터에게 max(1, 공격력×2 – 몬스터의 방어력)만큼의 데미지를 입힌다.
  EX: 4, // 얻는 경험치가 1.2배가 된다. 소수점 아래는 버린다.
  DX: 5, // 가시 함정에 입는 데미지가 1로 고정되며, Courage 장신구와 함께 착용할 경우, Courage의 공격력 효과가 두 배로 적용되는 대신 세 배로 적용된다.
  HU: 6, // 보스 몬스터와 전투에 돌입하는 순간 체력을 최대치까지 회복하고, 보스 몬스터의 첫 공격에 0의 데미지를 입는다.
  CU: 7, // 아무 능력이 없으며, 그냥 장신구 한 자리를 차지한다.
};
class Acc {
  constructor(type) {
    this.type = type;
  }
}