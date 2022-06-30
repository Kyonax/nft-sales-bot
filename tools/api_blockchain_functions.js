const theblockchainapi = require('theblockchainapi');
const axios = require('axios')
//Keys 
let defaultClient = theblockchainapi.ApiClient.instance;

let APIKeyID = defaultClient.authentications['APIKeyID'];
APIKeyID.apiKey = 'Jg7gGpZ7E0qjtJ2';

let APISecretKey = defaultClient.authentications['APISecretKey'];
APISecretKey.apiKey = 'Pr9iSo0eIoProXA';

let apiInstance = new theblockchainapi.SolanaNFTApi();
let network = 'mainnet-beta'; // String | The network ID (devnet, mainnet-beta)
//Functions of APP - Everything Important
module.exports = {
    getNFTData: async function (address) {
        let data_api = null
        await apiInstance.solanaGetNFT(network, address).then((data) => {            
            data_api = data;            
        }, (error) => {
            console.error(error);            
        });
        return data_api
    }
}