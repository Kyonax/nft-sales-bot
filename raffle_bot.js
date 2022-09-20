const solanaWeb3 = require('@solana/web3.js');
const { Connection, programs } = require('@metaplex/js');
const Exe = require("./tools/functions"), axios = require('axios'), API_RAFFLES = require('./tools/api_raffle_platform');

process.env.PROJECT_ADDRESS = "6zjwY1tbb3Lc2k6TcbAMWRHx6sQEVPt5Js7Aue6NkQH5";
process.env.DISCORD_URL = "https://discord.com/api/webhooks/1021878346176548924/eCT5Gx6IRBUqHgaJWcc1ZxC0mLIKMABtDa9NIuEfolsfFmEezVkladifGtwWVNNecJ2b";

if (!process.env.PROJECT_ADDRESS || !process.env.DISCORD_URL) {
    console.log("please set your environment variables!");
    return;
}


let _market, _jsonString;

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
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA": "Magic Eden",
    "v47bNPpG5Gr5bRsEFfU23rsrby5Fm1J1LMuzoGNL1T7": "Magic Eden",
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL": "Magic Eden",
    "tXmQMQYgaLaE8YesLCsfk2ujSYCKhVrZh8ELwECzGkg": "Magic Eden"
};

const timer = ms => new Promise(res => setTimeout(res, ms))
const printSalesInfo = (id, dateStarts, dateEnds, img, type, tittle, reference, payment_token, address_token) => {
    console.log("-------------------------------------------")
    console.log(`${type} State ---> #${id}`)
    console.log("Tittle: ", tittle)
    console.log("reference: ", reference)
    console.log("Image: ", img)
    console.log("Token: ", payment_token)
    console.log("Adress Token: ", address_token)
    console.log("Date Starts: ", dateStarts)
    console.log("Date Ends: ", dateEnds)
}


const postSaleToDiscord = (id, dateStarts, dateEnds, img, type, tittle, reference, payment_token, address_token,
    price_card, limit_tickets_card, limit_tickets_user, status_card, web_url, discord_url,
    magic_eden_url, twitter_url, winner, info, color) => {

    console.log(JSON.parse(winner))

    let _tittle = `${tittle} ` + "`💀`", winners = "", winners_data = "", index = 1, footer = "";
    let _emote = `https://cdn.discordapp.com/emojis/979699796673695824.webp`

    if (type.toLowerCase() === "past") {
        footer = `This Raffle Generated a total of ${Exe.numberSeparator(JSON.parse(winner).data_users_raffle.total_rot)} ${payment_token}.`;
    } else if (type.toLowerCase() === "raffle") {
        footer = `The Raffle Started on ${dateStarts}.`;
    }

    JSON.parse(winner).result.forEach(_winner => {
        winners = winners + "\n" + `${index}. Wallet: "${_winner.wallet}",`
        index++;
    });

    axios.post(process.env.DISCORD_URL,
        {
            "embeds": [
                {
                    "title": `${info} ${_tittle} #${id}`,
                    "description": `[${reference}](https://rottenville.io/rots/) **x${JSON.parse(winner).amount} Winner(s)**`,
                    "footer": {
                        "text": footer,
                        "icon_url": _emote
                    },
                    "color": color,
                    "fields": [
                        {
                            "name": "Limit Tickets",
                            "value": `${limit_tickets_card} Max of Tickets`,
                            "inline": true
                        },
                        {
                            "name": "Limit per User",
                            "value": `${limit_tickets_user} Max Tickets per User`,
                            "inline": true
                        },
                        {
                            "name": "Raffle Status",
                            "value": `The Raffle is now ${status_card}.`,
                            "inline": true
                        },

                        {
                            "name": "Total Wallets",
                            "value": `${JSON.parse(winner).data_users_raffle.total_users} 🪪`,
                            "inline": true
                        },
                        {
                            "name": "Total Tickets",
                            "value": `#${JSON.parse(winner).data_users_raffle.total_tickets}  🎟️`,
                            "inline": true
                        },
                        {
                            "name": "Price Ticket",
                            "value": `$${payment_token} ${price_card}`,
                            "inline": true
                        },

                        {
                            "name": "Raffle Ends",
                            "value": dateEnds,
                            "inline": true
                        },
                        {
                            "name": '\u200B',
                            "value": '\u200B',
                            "inline": true
                        },
                        {
                            "name": "Token Ticket",
                            "value": `[${payment_token}](https://solscan.io/token/${address_token})`,
                            "inline": true
                        },
                        {
                            "name": "Winner(s)",
                            "value": "```json" + `
{${winners}
}` + "```",
                            "inline": false
                        },
                        {
                            "name": "Information about the NFT Collection",
                            "value": `**[Website](${web_url}) | [Discord](${discord_url}) | [Twitter](${twitter_url}) | [Magic Eden](${magic_eden_url})**`,
                            "inline": false
                        },
                    ],
                    "image": {
                        "url": `${img}`,
                    }
                }
            ]
        }
    )
}

async function pastRaffle(props, index) {
    let { id, date, type, img, tittle, reference, payment_token, address_token,
        price_card, limit_tickets_card, limit_tickets_user, status_card, web_url, discord_url,
        magic_eden_url, twitter_url, winner } = props.raffles_api[index], _ObjRaffles = props.obj_raffles, key = false;

    const dateStarts = JSON.parse(date).start, dateEnds = JSON.parse(date).end;

    _ObjRaffles.past.forEach(_raffle => {
        if (_raffle === id) key = true;
    });

    _ObjRaffles.past.push(id);

    if (key === false) {
        if (!id) console.log("Couldn't get Raffles Info");

        printSalesInfo(id, dateStarts, dateEnds, img, type, tittle, reference, payment_token, address_token);

        await postSaleToDiscord(id, dateStarts, dateEnds, img, type, tittle, reference, payment_token, address_token,
            price_card, limit_tickets_card, limit_tickets_user, status_card, web_url, discord_url,
            magic_eden_url, twitter_url, winner, "Raffle Closed - ", 0xffbf3a)

        await Exe.writeJSON(_ObjRaffles, "./raffles.json");
    }
}

async function currentRaffle(props, index) {
    let { id, date, type, img, tittle, reference, payment_token, address_token,
        price_card, limit_tickets_card, limit_tickets_user, status_card, web_url, discord_url,
        magic_eden_url, twitter_url, winner } = props.raffles_api[index], _ObjRaffles = props.obj_raffles, key = false;

    const dateStarts = JSON.parse(date).start, dateEnds = JSON.parse(date).end;

    _ObjRaffles.raffle.forEach(_raffle => {
        if (_raffle === id) key = true;
    });

    _ObjRaffles.raffle.push(id);

    if (key === false) {
        if (!id) console.log("Couldn't get Raffles Info");

        printSalesInfo(id, dateStarts, dateEnds, img, type, tittle, reference, payment_token, address_token);

        await postSaleToDiscord(id, dateStarts, dateEnds, img, type, tittle, reference, payment_token, address_token,
            price_card, limit_tickets_card, limit_tickets_user, status_card, web_url, discord_url,
            magic_eden_url, twitter_url, winner, "New Raffle - ", 0x6415f9)

        await Exe.writeJSON(_ObjRaffles, "./raffles.json");
    }else {
        console.log(`Raffle [${id}] - is already registered.`);
    }
}

async function whitelistRaffle(props, index) {
    let { id, date, type, img, tittle, reference, payment_token, address_token,
        price_card, limit_tickets_card, limit_tickets_user, status_card, web_url, discord_url,
        magic_eden_url, twitter_url, winner } = props.raffles_api[index], _ObjRaffles = props.obj_raffles, key = false;

    const dateStarts = JSON.parse(date).start, dateEnds = JSON.parse(date).end;

    _ObjRaffles.whitelist.forEach(_raffle => {
        if (_raffle === id) key = true;
    });

    _ObjRaffles.whitelist.push(id);

    if (key === false) {
        if (!id) console.log("Couldn't get Raffles Info");

        printSalesInfo(id, dateStarts, dateEnds, img, type, tittle, reference, payment_token, address_token);

        await postSaleToDiscord(id, dateStarts, dateEnds, img, type, tittle, reference, payment_token, address_token,
            price_card, limit_tickets_card, limit_tickets_user, status_card, web_url, discord_url,
            magic_eden_url, twitter_url, winner, "New Whitelist - ", 0x6415f9)

        await Exe.writeJSON(_ObjRaffles, "./raffles.json");
    }else {
        console.log(`Raffle [${id}] - is already registered.`);
    }
}

async function readRaffles(props, index) {

    try {
        let _raffles_api = props.raffles_api, { id, type } = _raffles_api[index];

        if (type.toLowerCase() === "past") {
            return await pastRaffle(props, index);
        } else if (type.toLowerCase() === "raffle") {
            return await currentRaffle(props, index);
        } else if (type.toLowerCase() === "whitelist") {
            return await whitelistRaffle(props, index);
        }

    } catch (error) {
        console.log(error);
    }
}

const runRafflesBot = async () => {
    console.log(`- Starting New Raffles bot...`);
    try {
        let raffles_api, lastRaffleApi, options = {}, no_transactions = [];
        let ObjRaffles = await Exe.readJSON('./raffles.json'), _ObjRaffles = JSON.parse(ObjRaffles);

        raffles_api = await API_RAFFLES.getAll();

        let iw = 0;

        if (!raffles_api.length) {
            console.log("polling...")
            await timer(pollingInterval);
        }

        let _objProps = {
            obj_raffles: _ObjRaffles,
            raffles_api: raffles_api,
            lastRaffleApi: lastRaffleApi,
            options: options,
            iw: iw,
            no_transactions: no_transactions
        }

        let _props = await Exe.propsObject(_objProps, "obj_raffles.raffles_api.lastRaffleApi.options.iw.no_transactions");
        await Exe.loopMethodEach(readRaffles, _props, 1000, iw, raffles_api.length );


    } catch (error) {
        console.log("error fetching raffles: ", error);
    }
}

runRafflesBot();

