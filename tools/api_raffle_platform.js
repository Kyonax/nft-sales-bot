require("dotenv").config(); const axios = require('axios');

module.exports = {
    getAll: async function () {

        let data = null, url = process.env.API_RAFFLES_CARDS + '/all';
        await axios.get(url).then((api_data_) => {
            data = api_data_.data;
        })

        return data
    },
    getCard: async function (id) {
        let data = null, url = process.env.API_RAFFLES_CARDS + `/search/id/${id}`;
        await axios.get(url).then((api_data_) => {
            data = api_data_.data;
        })

        return data
    },
    getType: async function (type) {
        let data = null, url = process.env.API_RAFFLES_CARDS + `/search/type/${type}`;
        await axios.get(url).then((api_data_) => {
            data = api_data_.data;
        })

        return data
    },
    postCard: async function (type, img, tittle, reference, payment_token, address_token, price_card, limit_tickets_card, limit_tickets_user, status_card, collection_verified, web_url, discord_url, twitter_url, magic_eden_url, date, winner) {
        let _obj = {
            type: type, img: img, tittle: tittle, reference: reference, payment_token: payment_token, address_token: address_token, price_card: price_card, limit_tickets_card: limit_tickets_card, limit_tickets_user: limit_tickets_user,
            status_card: status_card, collection_verified: collection_verified, web_url: web_url, discord_url: discord_url, twitter_url: twitter_url, magic_eden_url: magic_eden_url, date: date, winner: winner, web: process.env.REACT_APP_CLAVEWEB
        };

        let _config = {
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Accept': 'application/json',
                "Access-Control-Allow-Origin": "*",
            }
        }
        await axios.post(process.env.API_RAFFLES_CARDS + `/register`, _obj, _config)
            .then(function (response) {
                console.log(response);
            }).catch(function (error) {
                console.log(error.response);
            });
    },
    patchCard: async function (id, attribute, value) {
        let _obj = { id: id, web: process.env.REACT_APP_CLAVEWEB, par: attribute, valor: value };

        let _config = {
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Accept': 'application/json',
                "Access-Control-Allow-Origin": "*",
            }
        }
        await axios.put(process.env.API_RAFFLES_CARDS + `/update`, _obj, _config)
            .then(function (response) {
                console.log(response);
            }).catch(function (error) {
                console.log(error.response);
            });
    },
    deleteCard: async function (id) {
        let _obj = { id: id, web: process.env.REACT_APP_CLAVEWEB };

        let _config = {
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Accept': 'application/json',
                "Access-Control-Allow-Origin": "*",
            }
        }
        await axios.delete(process.env.API_RAFFLES_CARDS + `/delete`, { data: _obj }, _config)
            .then(function (response) {
                console.log(response);
            }).catch(function (error) {
                console.log(error.response);
            });
    }
}
