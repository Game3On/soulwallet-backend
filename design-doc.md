design doc
## Background
+ Set the backend total technical design and environment.
## All functions
+ From design: 
+ [Security center solution](https://github.com/proofofsoulprotocol/smart-contract-wallet-4337/blob/main/dev-docs/security-center-solution.md)
+ [Social recovery solution](https://github.com/proofofsoulprotocol/smart-contract-wallet-4337/blob/main/dev-docs/Social-recovery-solution.md)
+ ![See the flow](recovery-sequence-diagram.png)
### APIs
+ APIs for Chrome plugin 
+ 1. verifyEmail, input: email, output: random number(6) in mail.
+ 2. verifyEmailNum, input: email, random number, output: true or false.
+ Xuri finished in verify.js
+ -----
+ 3. addAccount, input: email, wallet_address(unique,not required), output: true or false; async invoke after finished the create account action with onchain contract.
+ 4. updateAccountGuardian, input: email, guardians, output: true or false; async invoke after finished the setting guardian action with onchain contract.
+ 5. updateAccount, input: email, wallet_address(unique, required), output: true or false; async invoke after finished the activating account action with onchain contract.
+ 6. isWalletOwner, input email, output: true or false.
+ Jhf finished in account.js
+ ------
+ 7. addRecoveryRecord, input: email, wallet_address, output: true or false.
+ 8. fetchRecoveryRecords, input: email, output: false or record structure.
+ 9. updateRecoveryRecord, input: email, guardian-address(single update), output: true or false; after signed onchain, async invoke this method to mark specific guardian has signed.
+ -----------
+ Xuri will finish it.
<!-- + 10. getGuardiansWallet, todo, finish later. -->
+ 10. getWalletsRecoveryRecords, get a guardian wallet's recovery records. input wallet_address, output: recovery records array(to be discussed) .
+ 11. getGuardianSetting, it will return a PoC product setting formate, it can be stored in the Account object or a individual setting Object, to be discussed. 
+ input: email, output: Account obj or setting obj.
+ The structure behind will be stored in Account obj.
```
{
    "total": 5,
    "min": 3,
    "setting": "3/5"
}
```
+ 12. triggerRecovery, input: email, wallet_address, return true or false, chrome plugin should store the recovery credential in local?: 
+ 
```
{
    "wallet_address": "sldfjalsd023840",
    "new_key(EOA wallet address?)": "230942394203984sdf"
}
```
+ we have two method to trigger the recovery contract invoke, it depends on the wallet contract's gas fee pay method. One is the last signed guardian? or the security center keeping calculate if has enough signature are collected, and then notify the chrome plugin to invoke the recovery contract, all gas problem be resolved by paymaster, because of the chrome plugin is pending on recovery and the security center has no so much money to pay all recoveries. So triggerRecovery return true or false, then chrome plugin or security center call the paymaster to begin the contract's replace key method.

+ 13. clearRecords, input: email, return true or false. It will clear the specific recovery records on the security server, but can't clear the recovery data which is on progress but not finished.
+ --------
+ To be discussed.


## Collections(Objects)
### 1.Accounts
+ model/account.js
```
  { 
    "email": "testshuaishuai@gmail.com",
    "wallet-address": "a contract wallet address",
    "guardians": [
        {
            "type":"EOA",
            "address":"0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
            "signature": "LIJOEIUR09328049sjdijf" //data was signed
        },
        {},{}],   
    <!-- "status": "created, activated, recovering, recovered" -->
  }
```
### 1.1 Guardian_settings
```
{
    "email": "aaa@bbb.net", //sync with onchain data cycle time.
    "wallet_address": "sdkfjsdf9879",
    "total": 5,
    "min": 3,
    "has_default": true, //if has set a SoulWallet default guardian
    "setting": "3/5"
} 
```    
+ Belongs to account area, add-guardian-setting, update-guardian-setting
+ Jhf finished in guardian-setting.js        
### 2.VerifyRecords
+ model/verify-records.js
```
{
    email: "aa@aa.net",
    code: "234567",
    date: date type,
}
```
### 3.Guardians
+ Model: guardian.js
<!-- + Guardians save in the Accounts collection. -->
+ We will add Guardians obj in future for index from guardians view.
+ 
```
{
    guardian_address: "asdf234gg",
    wallet_address: [asdfadf,123123,23213,2323]
}
```

### 4.RecoveryRecords

```
recovery record structure
{
  email: "aa@aa.com",
  wallet_address: "lajsdf09rp23092-3jsdksdf",
  recovery_records: [
      {
          guardian_address: "asdfadf23234233",
          signature: "sdfasdlk98kkskdjf",
          sign_status: true
      },
      {
          guardian_address: "sdfk8878dglkdg0g",
          signature: "sdfasdlk98kkskdjf",
          sign_status: false
      },
      {
          guardian_address: "ksjdlfj0808092834g",
          signature: "sdfasdlk98kkskdjf",
          sign_status: false
      }
  ]
}
```

## Internal and Utils
### MakeResponse
+ Input parameter, return response json formate.

### SendEmail

## Global
### API request and response
```
response return data structure 
{   
  <!-- method: triggerRecovery,  -->
  code: 200, // 500,401..
  status : OK, //Error
  result: {
    data structure //json obj
    },
  msg: "msgs returned",
}
or
{   
  method: triggerRecovery, 
  code: 4001, 
  status : Error, 
  params: {data structure},
  msg: "msgs returned",
  hash: hash
}

```

### Design logic
#### Scenarios or User Case
+ All products want to resolve some questions happening in different scenarios.
+ We define 3 Scenarios in PoC: Create\Activate\Recovery
#### Main Objects
+ All scenarios are different Business Object and their relations weaving together.
+ We have 3 BO: Account, Guardians, Recovery Records, accumulate all the scenarios data.

#### Main APIs
+ All APIs are relations and actions between BOs.
+ We have about 13 methods above.



