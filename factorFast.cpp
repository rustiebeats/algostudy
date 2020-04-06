#define _DEBUG
#include <bits/stdc++.h>
using namespace std;
#define endl "\n"
#define X first
#define Y second
typedef long long ll;
typedef pair<int, int> pii;
typedef pair<ll, ll> pll;
const double pi = acos(-1.0);
////
int n;
int minFactor[50000];
// minFactor[i] == smallest div of i

void erathosthenes2(){
    minFactor[0] = minFactor[1] = 1;
    for(int i = 2; i <= n; i++){
        minFactor[i] = i;
    }

    for(int i = 2; i*i <= n; i++){
        if(minFactor[i] == i){
            for(int j = i*i; j <= n; j += i){
                if(minFactor[j] == j) minFactor[j] = i;
            }
        }
    }
}

vector<int> factor(int n){
    vector<int> ret;
    while(n > 1){
        ret.push_back(minFactor[n]);
        n /= minFactor[n];
    }
    return ret;
}
int main(){
#ifdef _DEBUG
    freopen("input.txt", "r", stdin);
    freopen("output.txt", "w", stdout);
#endif
    ios::sync_with_stdio(false);
    cin.tie(NULL);
    
    

    return 0;
}