#define _DEBUG
#include <bits/stdc++.h>
using namespace std;
#define endl "\n"
typedef long long ll;
typedef pair<int, int> pii;
typedef pair<ll, ll> pll;
////

int N, M;
vector<string> grid(102);
string movement;

class Monster{
public:
    string name;
    int att, def, health, exp;
    bool Boss = false;
    Monster(string &_name, int _att, int _def, int _health, int _exp, bool _boss){
        name = _name;
        att = _att;
        def = _def;
        health = _health;
        exp = _exp;
        Boss = _boss;
    }
};

class Player{
public:
    int health;
    int att;
    int def;
    int exp;
    int level;
    int weapon;
    int armor;
    vector<pii> jewel;

    
};

int main(){
#ifdef _DEBUG
    freopen("input.txt", "r", stdin);
    freopen("output.txt", "w", stdout);
#endif
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    cin >> N >> M;

    int K = 0; // number of monsters including boss
    int L = 0; // number of items
    for(int i = 0; i < N; i++){
        cin >> grid[i];
        for(int j = 0; j < M; j++){
            if(grid[i][j] == '&' or grid[i][j] == 'M') K++;
            else if(grid[i][j] == 'B') L++;
        }
    }
    cin >> movement;
    
    // monster
    for(int i = 0; i < K; i++){
        int R, C, W, A, H, E;
        // r,c /  attack, armor, health, exp
        // S = name;
        string S;
        cin >> R >> C >> S >> W >> A >> H >> E;

        R--; C--;
        
    }

    // item
    for(int i = 0; i < L; i++){
        int R, C;
        char T;
        cin >> R >> C >> T;
        if(T == 'W' or T == 'A'){
            int _; cin >> _;
        }
        else if(T == 'O'){
            string S; cin >> S;
        }
    }


    //

    Player player;

    return 0;
}