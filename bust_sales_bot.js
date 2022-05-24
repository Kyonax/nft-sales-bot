const solanaWeb3 = require('@solana/web3.js');
const { Connection, programs } = require('@metaplex/js');
const axios = require('axios');
const Sales = require("./busts_sales.json")
const fs = require("fs");

process.env.PROJECT_ADDRESS = "8vqe79fS3hecnwiZdF7fVqH9A3ZsdfTGgwgz3hMsPb1V";
process.env.DISCORD_URL = "https://discord.com/api/webhooks/978367308261117972/7DCgnq8fdJZ8WoIxeaS7NV0kZEajSN6zeUalGKhxYDVjdc5QtHh5FIpNYcj5Eb2tZB7_";

if (!process.env.PROJECT_ADDRESS || !process.env.DISCORD_URL) {
    console.log("please set your environment variables!");
    return;
}


let _market, _jsonString, iw = 0;

const projectPubKey = new solanaWeb3.PublicKey(process.env.PROJECT_ADDRESS);
const url = solanaWeb3.clusterApiUrl('mainnet-beta');
const solanaConnection = new solanaWeb3.Connection(url, 'confirmed');
const metaplexConnection = new Connection('mainnet-beta');
const { metadata: { Metadata } } = programs;
const pollingInterval = 2000; // ms

const marketplaceMap = {
    "MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8": "Magic Eden",
    "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K": "Magic Eden V2",
    "HZaWndaNWHFDd9Dhk5pqUUtsmoBCqzb1MLu3NAh1VX6B": "Alpha Art",
    "617jbWo616ggkDxvW1Le8pV38XLbVSyWY8ae6QUmGBAU": "Solsea",
    "CJsLwbP1iu5DuUikHEJnLfANgKy6stB2uFgvBBHoyxwz": "Solanart",
    "A7p8451ktDCHq5yYaHczeLMYsjRsAkzc3hCXcSrwYHU7": "Digital Eyes",
    "AmK5g2XcyptVLCFESBCJqoSfwV3znGoVYQnqEnaAZKWn": "Exchange Art",
    "hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk": "OpenSea",
};

const runSalesBot = async () => {
    console.log("Alpha Gen Starting sales bot...");

    let signatures;
    let lastKnownSignature;
    const options = {};


    try {
        signatures = await solanaConnection.getSignaturesForAddress(projectPubKey, options);
        if (!signatures.length) {
            console.log("polling...")
            await timer(pollingInterval);
        }
    } catch (err) {
        console.log("error fetching signatures: ", err);
    }

      

    try {
        iw = signatures.length - 1;
        function readSignatures() {
            setTimeout(async function () {


                try {
                    let { signature } = signatures[iw];
                    const txn = await solanaConnection.getTransaction(signature);
                    console.log(signature)
                    if (txn.meta && txn.meta.err != null) { }

                    const dateString = new Date(txn.blockTime * 1000).toLocaleString();
                    const price = Math.abs((txn.meta.preBalances[0] - txn.meta.postBalances[0])) / solanaWeb3.LAMPORTS_PER_SOL;
                    const accounts = txn.transaction.message.accountKeys;
                    const marketplaceAccount = accounts[accounts.length - 1].toString();
                    let key = false;

                    _jsonString = await fs.readFileSync('./busts_sales.json', 'utf8', (err, jsonString) => {
                        if (err) {
                            console.log("File read failed:", err)
                            return
                        }
                    })

                    JSON.parse(_jsonString).done.forEach(_sign => {
                        if (_sign === signature) {
                            key = true;
                        }
                    });

                    if (key === false) {
                        if (marketplaceMap[marketplaceAccount]) {
                            const metadata = await getMetadata(txn.meta.postTokenBalances[0].mint);

                            Sales.body.push(txn);
                            Sales.done.push(signature);

                            fs.writeFile(
                                "./busts_sales.json",
                                JSON.stringify(Sales),
                                (err) => {
                                    if (err) console.log(err);
                                }
                            );
                            


                            if (!metadata) {
                                console.log("couldn't get metadata");                                
                            }

                            printSalesInfo(dateString, price, signature, metadata.name, marketplaceMap[marketplaceAccount], metadata.image);
                            await postSaleToDiscord(metadata.name, price, dateString, signature, metadata.image, Sales)
                            
                        } else {
                            console.log("not a supported marketplace sale");
                            Sales.body.push(txn);
                            Sales.done.push(signature);

                            fs.writeFile(
                                "./busts_sales.json",
                                JSON.stringify(Sales),
                                (err) => {
                                    if (err) console.log(err);
                                }
                            );
                        }
                    }

                } catch (err) {
                    console.log("error while going through signatures: ", err);                    
                }



                iw--
                if (iw >= 0) {
                    readSignatures();
                } else {
                    console.log(`[] Problem Fetching - Signature`);
                    runSalesBot();
                }
            }, 1000);

        }

        for (let i = signatures.length - 1; i >= 0; i--) {
            let {signature} = signatures[i];
    
            let _key = true, iterator = 0;
            _jsonString = await fs.readFileSync('./busts_sales.json', 'utf8', (err, jsonString) => {
                if (err) {
                    console.log("File read failed:", err)                
                }
            })
    
            JSON.parse(_jsonString).done.forEach(_sign => {            
                if (_sign != signature) {

                    _key = false;                                                            
                    iw = signatures.length - iterator;           
                    i = 0;         
                }
                iterator++
            });
            if (_key === false) {
                console.log(signature+` Exist: ${_key} - Number: ${iw}`)      
            } 
    
        } 

        readSignatures();

    } catch (error) {
        console.log(error)
    }

    lastKnownSignature = signatures[0].signature;
    if (lastKnownSignature) {
        options.until = lastKnownSignature;
    }

}
runSalesBot();

const printSalesInfo = (date, price, signature, title, marketplace, imageURL) => {
    _market = marketplace;
    console.log("-------------------------------------------")
    console.log(`Sale at ${date} ---> ${price} SOL`)
    console.log("Signature: ", signature)
    console.log("Name: ", title)
    console.log("Image: ", imageURL)
    console.log("Marketplace: ", marketplace)
}

const timer = ms => new Promise(res => setTimeout(res, ms))

const getMetadata = async (tokenPubKey) => {
    try {
        const addr = await Metadata.getPDA(tokenPubKey)
        const resp = await Metadata.load(metaplexConnection, addr);
        const { data } = await axios.get(resp.data.data.uri);

        return data;
    } catch (error) {
        console.log("error fetching metadata: ", error)
    }
}

const postSaleToDiscord = (title, price, date, signature, imageURL, Sales) => {
    axios.post(process.env.DISCORD_URL,
        {
            "embeds": [
                {
                    "title": `BUSTS SCULPTURES ` + "`🧠`",
                    "description": `**Rotten:** *${title}*`,
                    "color": 15970596,
                    "fields": [
                        {
                            "name": "Price",
                            "value": `${price} $SOL`,
                            "inline": true
                        },
                        {
                            "name": "Date",
                            "value": `${date}`,
                            "inline": true
                        },
                        {
                            "name": "MarketPlace",
                            "value": `${_market}`,
                            "inline": true
                        },
                        {
                            "name": "Transaction",
                            "value": `**[Solscan Signature](https://explorer.solana.com/tx/${signature}): ` + "`" + signature + "`" + `**`
                        },
                        {
                            "name": "Collection Links",
                            "value": `**[Magic Eden](https://magiceden.io/marketplace/rotten_ville_sculptures) | [Solanart](https://solanart.io/collections/rottenvillesculptures)**`
                        }
                    ],
                    "image": {
                        "url": `${imageURL}`,
                    }
                }
            ]
        }
    )    
}