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

bool isPrime(int n){
    if(n <= 1) return false;
    if(n == 2) return true;

    if(n % 2 == 0) return false;
    //
    for(int div = 3; div * div <= n; div++){
        if(n % div == 0) return false;
    }
    
    return true;
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