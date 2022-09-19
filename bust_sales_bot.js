const solanaWeb3 = require('@solana/web3.js');
const { Connection, programs } = require('@metaplex/js');
const Exe = require("./tools/functions")
const axios = require('axios');
const Sales = require("./busts_sales.json")
const fs = require("fs");

process.env.PROJECT_ADDRESS = "8vqe79fS3hecnwiZdF7fVqH9A3ZsdfTGgwgz3hMsPb1V";
process.env.DISCORD_URL = "https://discord.com/api/webhooks/979485093783535667/UD-QyE8Ft98R5EDrTV-fOUBFiSaAzhdq-1Y6F_gbbTiiEeMLQrv0A2_iWnNBkzr7H1Nu";

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
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" : "Magic Eden",
    "v47bNPpG5Gr5bRsEFfU23rsrby5Fm1J1LMuzoGNL1T7" : "Magic Eden",
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL" : "Magic Eden",
    "tXmQMQYgaLaE8YesLCsfk2ujSYCKhVrZh8ELwECzGkg" : "Magic Eden"
};

const timer = ms => new Promise(res => setTimeout(res, ms))
const printSalesInfo = (date, price, signature, title, marketplace, imageURL, num1, num2, sol1) => {
    _market = marketplace;
    console.log("-------------------------------------------")
    console.log(`Sale at ${date} ---> ${price} SOL | (${num1} - ${num2})/${sol1}`)
    console.log("Signature: ", signature)
    console.log("Name: ", title)
    console.log("Image: ", imageURL)
    console.log("Marketplace: ", marketplace)
}

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
    let _tittle = `${title} (Bust) $BUY ` + "`🧠`"
    let _spec = ``;
    let _royalties_DAO = ((price * 0.08) * 0.75).toFixed(3) + " $SOL +";
    let _royalties_DEV = ((price * 0.08) * 0.25).toFixed(4) + " $SOL +";
    let _emote = `https://cdn.discordapp.com/emojis/905442001359614002.webp`

    if (price <= 0.01) {
        _tittle = `${title} (Bust) LISTING ` + "`🧠`"
        _royalties = ``;
        _spec = `Listing `
        _emote = `https://cdn.discordapp.com/emojis/905441646487957534.webp`
    }


    axios.post(process.env.DISCORD_URL,
        {
            "embeds": [
                {
                    "title": _tittle,
                    "footer": {
                        "text": `${date} UTC`,
                        "icon_url": _emote
                    },
                    "color": 15970596,
                    "fields": [
                        {
                            "name": "Price",
                            "value": `${price} $SOL`,
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
                            "name": `25% Royalties\n${_royalties_DEV}`,
                            "value": `**[Dev Team - RT](https://explorer.solana.com/address/D6HxbQa7juwKoMDTUHJtJWW6WLG9gzKfRA8iQmd2oZ1x)**`,
                            "inline": true
                        }, {
                            "name": '\u200B',
                            "value": '\u200B',
                            "inline": true
                        },
                        {
                            "name": `75% Royalties\n${_royalties_DAO}`,
                            "value": `**[Rottens DAO](https://explorer.solana.com/address/8vqe79fS3hecnwiZdF7fVqH9A3ZsdfTGgwgz3hMsPb1V)**`,
                            "inline": true
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


async function readSignatures(props, index) {

    try {
        let _signatures = props.signatures, { signature, confirmationStatus } = _signatures[index], key = false;
        const txn = await solanaConnection.getTransaction(signature); if (txn.meta && txn.meta.err != null) { };
        const dateString = new Date(txn.blockTime * 1000).toLocaleString(), price = Math.abs((txn.meta.preBalances[0] - txn.meta.postBalances[0])) / solanaWeb3.LAMPORTS_PER_SOL, accounts = txn.transaction.message.accountKeys, marketplaceAccount = accounts[accounts.length - 1].toString();


        let ObjBustSales = await Exe.readJSON('./busts_sales.json'), _ObjBustSales = JSON.parse(ObjBustSales);
        _ObjBustSales.done.forEach(_sale => {
            if (_sale === signature) key = true;
        });

        _ObjBustSales.done.push(signature);

        if (key === false) {                                  

            if (marketplaceMap[marketplaceAccount]) {
                const metadata = await getMetadata(txn.meta.postTokenBalances[0].mint);

                if (!metadata) {
                    console.log("Couldn't get metadata");
                }

                if (!metadata.name.includes("Bust Sculpture")) return console.log("The Transaction is not a Bust Sculpture");
                printSalesInfo(dateString, price, signature, metadata.name, marketplaceMap[marketplaceAccount], metadata.image, Math.abs(txn.meta.preBalances[0]), Math.abs(txn.meta.postBalances[0]), Math.abs(solanaWeb3.LAMPORTS_PER_SOL));
                await postSaleToDiscord(metadata.name, price, dateString, signature, metadata.image, Sales)
            } else {

                console.log(`Signature [${signature}] - comes from a not supported marketplace.`);
            }

            await Exe.writeJSON(_ObjBustSales, "./busts_sales.json");
        }

    } catch (error) {
        console.log(error);
    }
}

const runSalesBot = async () => {
    console.log(`- Starting Bust Sculptures Sales bot...`);
    try {
        let signatures, lastKnownSignature, options = {}, no_transactions = [];
        let ObjBustSales = await Exe.readJSON('./busts_sales.json'), _ObjBustSales = JSON.parse(ObjBustSales);
        signatures = await solanaConnection.getSignaturesForAddress(projectPubKey, options);
        let iw = signatures.length - 1;

        if (!signatures.length) {
            console.log("polling...")
            await timer(pollingInterval);
        }

        for (let _i = iw; _i >= 0; _i--) {
            _ObjBustSales.done.forEach(_objsale => {
                if (_objsale === signatures[_i].signature) {
                    iw--
                }
            });
        }

        let _objProps = {
            signatures: signatures,
            lastKnownSignature: lastKnownSignature,
            options: options,
            iw: iw,
            no_transactions: no_transactions
        }
        let _props = await Exe.propsObject(_objProps, "signatures.lastKnownSignature.options.iw.no_transactions");
        await Exe.loopMethodEachReverse(readSignatures, _props, 1000, iw, 0);
    } catch (error) {
        console.log("error fetching signatures: ", error);
    }
}

runSalesBot();

