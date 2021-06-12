#define _DEBUG
#include <cstdio>
#include <cstring>
#include <set>
#include <unordered_map>
#include <algorithm>
#include <map>
using namespace std;
#define endl "\n"
typedef long long ll;
typedef pair<int, int> pii;
typedef pair<ll, ll> pll;
////

const int dy[4] = {-1, 1, 0, 0};
const int dx[4] = {0, 0, -1, 1};
const int MAX_N = 100;
const int MAX = MAX_N*MAX_N;
const int MAX_NAME = 10;
const int MAX_S = 5000;



enum accType {HR, RE, CO, EX, DX, HU, CU};

/*
HP Regeneration(HR) : 전투에서 승리할 때마다 체력을 3 회복한다. 체력은 최대 체력 수치까지만 회복된다.
Reincarnation(RE) : 주인공이 사망했을 때 소멸하며, 주인공을 최대 체력으로 부활시켜 준 뒤, 주인공을 첫 시작 위치로 돌려보낸다. 레벨이나 장비 등의 다른 정보는 변함이 없다. 전투 중이던 몬스터가 있다면 해당 몬스터의 체력도 최대치로 회복된다. 소멸한 뒤에 다시 이 장신구를 얻는다면 또 착용한다.
Courage(CO) : 모든 전투에서, 첫 번째 공격에서 주인공의 공격력(무기 합산)이 두 배로 적용된다. 즉, 모든 첫 공격에서 몬스터에게 max(1, 공격력×2 – 몬스터의 방어력)만큼의 데미지를 입힌다.
Experience(EX) : 얻는 경험치가 1.2배가 된다. 소수점 아래는 버린다.
Dexterity(DX) : 가시 함정에 입는 데미지가 1로 고정되며, Courage 장신구와 함께 착용할 경우, Courage의 공격력 효과가 두 배로 적용되는 대신 세 배로 적용된다.
Hunter(HU) : 보스 몬스터와 전투에 돌입하는 순간 체력을 최대치까지 회복하고, 보스 몬스터의 첫 공격에 0의 데미지를 입는다.
Cursed(CU) : 아무 능력이 없으며, 그냥 장신구 한 자리를 차지한다.
*/
char grid[100][100];

int main(){
#ifdef _DEBUG
    freopen("input.txt", "r", stdin);
    freopen("output.txt", "w", stdout);
#endif
    /*ios::sync_with_stdio(false);
    cin.tie(NULL);*/

    int N, M;
    int inity, initx;
    int y, x;
    int monsternum = 0, itemnum = 0;

    unordered_map<char, int> C2D;
	C2D['U'] = 0;
    C2D['D'] = 1;
    C2D['L'] = 2;
    C2D['R'] = 3;
    int movement[5002];
    int step = 0;

    scanf("%d %d\n", &N, &M);

    
    for(int i = 0; i < N; i++){
        for(int j = 0; j < M; j++){
            grid[i][j] = getchar();
            if(grid[i][j] == '@'){
                inity = i;
                initx = j;
                y = i;
                x = j;
                grid[i][j] = '.';
            }
            else if(grid[i][j] == '&' || grid[i][j] == 'M') monsternum++;
            else if(grid[i][j] == 'B') itemnum++;
        }
        getchar();
    }


	

    while(1){
        char c = getchar();
        if(c == '\n') break;
        movement[step++] = C2D[c];
    }

	int mobNum[MAX_N][MAX_N], mAtk[MAX], mDef[MAX], mHp[MAX], mMaxHp[MAX], mExp[MAX];
	int itemNum[MAX_N][MAX_N], iVal[MAX];
	accType iAccType[MAX];
	char mName[MAX][MAX_NAME+1], iType[MAX];
    for(int i = 0; i < monsternum; i++){
		int r, c;
		scanf("%d %d %s %d %d %d %d", &r, &c, mName[i], mAtk+i, mDef+i, mHp+i, mExp+i);
		--r; --c;
		mobNum[r][c] = i;
		mMaxHp[i] = mHp[i];
    }
    
    for(int i = 0; i < itemnum; i++){
        int r, c;
		scanf("%d %d %c", &r, &c, iType+i);
		--r; --c;
		itemNum[r][c] = i;
		if(iType[i] == 'O'){
			char accS[3];
			scanf("%s", accS);
			if(strcmp(accS, "HR") == 0) iAccType[i] = HR;
			else if(strcmp(accS, "RE") == 0) iAccType[i] = RE;
			else if(strcmp(accS, "CO") == 0) iAccType[i] = CO;
			else if(strcmp(accS, "EX") == 0) iAccType[i] = EX;
			else if(strcmp(accS, "DX") == 0) iAccType[i] = DX;
			else if(strcmp(accS, "HU") == 0) iAccType[i] = HU;
			else iAccType[i] = CU;
		}
		else scanf("%d", iVal+i);
    }

    int turn = 0, lv = 1, hp = 20, maxHp = 20, atk = 2, def = 2, exp = 0, maxExp = 5;
	int weapon = 0, armor = 0;
	set<accType> accs;
	bool win = false, lose = false;
	char killer[MAX_NAME+1];


    for(; turn < step; ++turn){


        int ny = y + dy[movement[turn]];
        int nx = x + dx[movement[turn]];

        if(ny < 0 || ny >= N || nx < 0 || nx >= M || (grid[ny][nx] == '#')) ;
        else{
            y = ny;
            x = nx;
        }

        // needle
        if(grid[y][x] == '^'){
            int damage = 5;
            if(accs.count(DX)) damage = 1;
            hp -= damage;
            if(hp <= 0){
                if(accs.count(RE)){
                    accs.erase(RE);
                    hp = maxHp;
                    y = inity;
                    x = initx;
                }else{
                    hp = 0;
                    lose = true;
                    ++turn;
                    strcpy(killer, "SPIKE TRAP");
                    break;
                }
            }
        }

        else if(grid[y][x] == 'B'){
            int _ = itemNum[y][x];
            if(iType[_] == 'W') weapon = iVal[_];
            else if(iType[_] == 'A') armor = iVal[_];            
            else{
                accType aaaaac = iAccType[_];
                if(!accs.count(aaaaac) and (accs.size() < 4)) accs.insert(aaaaac);
            }
            grid[y][x] = '.';
        }

        else if(grid[y][x] == '.');

        else{
            int x = mobNum[y][x];
            bool isBoss = (grid[y][x] == 'M'), reinFlag = false;
            if(isBoss and accs.count(HU)) hp = maxHp;

            for(int t = 0; ; ++t){
                int myAtk = atk + weapon;
                if(t == 0 and accs.count(CO)) myAtk *= (accs.count(DX) ? 3 : 2);
                int myDamage = max(myAtk - mDef[x], 1);
                mHp[x] -= myDamage;
                if(mHp[x] <= 0){
                    int getExp = mExp[x];
                    if(accs.count(EX)) getExp = (getExp * 1.2 + 0.0001);
                    exp += getExp;
                    if(exp >= maxExp){
                        lv++;
                        hp = maxHp = maxHp + 5;
                        atk += 2;
                        def += 2;
                        exp = 0;
                        maxExp = lv * 5;
                    }
                    break;
                }

                int enemyatk = mAtk[x];
                int enemyDamage = max(enemyatk - (def + armor), 1);
                if(t == 0 and isBoss and accs.count(HU)) enemyDamage = 0;
                hp -= enemyDamage;
                if(hp <= 0){
                    if(accs.count(RE)){
                        accs.erase(RE);
                        hp = maxHp;
                        mHp[x] = mMaxHp[x];
                        y = inity;
                        x = initx;
                        reinFlag = true;
                    }
                    else{
                        hp = 0;
                        lose = true;
                        strcpy(killer, mName[x]);
                    }
                    break;
                }
            }

            if(reinFlag) continue;
            if(lose){
                ++turn;
                break;
            }

            if(accs.count(HR)) hp = min(hp + 3, maxHp);
            if(isBoss){
                win = true;
                ++turn;
                break;
            }
            grid[y][x] = '.';
        }
    }

    if(!lose) grid[y][x] = '@';
    for(int i = 0; i < N; i++){
        for(int j = 0; j < M; j++){
            putchar(grid[i][j]);
        }
        puts("");
    }

    printf("Passed Turns : %d\n", turn);
	printf("LV : %d\n", lv);
	printf("HP : %d/%d\n", hp, maxHp);
	printf("ATT : %d+%d\n", atk, weapon);
	printf("DEF : %d+%d\n", def, armor);
	printf("EXP : %d/%d\n", exp, maxExp);

    if(win) puts("YOU WIN!");
	else if(lose) printf("YOU HAVE BEEN KILLED BY %s..\n", killer);
	else puts("Press any key to continue.");
    return 0;
}