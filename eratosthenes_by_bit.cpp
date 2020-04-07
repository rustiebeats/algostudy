int MAX_N = 99999999;
int n;
unsigned char sieve[10000000];

inline bool isPrime(int k){
    return sieve[k >> 3] & sieve[1 << (k & 7)];
}

inline void setComposite(int k){
    sieve[k >> 3] &= ~(1 << (k & 7));
}

void eratosthenes(){
    memset(sieve, 255, sizeof(sieve));
    setComposite(0);
    setComposite(1);

    for(int i = 2; i*i <= n; i++){
        if(isPrime(i)){
            for(int j = i*i; j <= n; j += i){
                setComposite(j);
            }
        }
    }
}