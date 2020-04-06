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

vector<int> factorSimple(int n){
    vector<int> ret;
    for(int div = 2; div * div <= n; div++){
        while(n % div == 0){
            n /= div;
            ret.push_back(div);
        }
    }
    if(n > 1) ret.push_back(n);
    return ret;
} // sqrt(n)까지 소수를 미리 찾아두면 더 빠름

int main(){
#ifdef _DEBUG
    freopen("input.txt", "r", stdin);
    freopen("output.txt", "w", stdout);
#endif
    ios::sync_with_stdio(false);
    cin.tie(NULL);
    
    

    return 0;
}