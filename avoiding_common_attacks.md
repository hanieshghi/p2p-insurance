1. I have used SAFEMATH library to ensure that over/under flow does not happen.
2. I did not use tx.origin
3. I did not use unlimited arrays and in case of using for loops, I used limitations.
4. the contract does not rely on its balance.
5. I used withdrawal pattern because of re-entrancy  and denial of service attacks.

 
