// const kategori_service = require('../services/kategorier.js');


async function hent_template_data() {
    let data = {};
    data.alle_kategorier = [];
 
    data.butik = {
        "butik_id": 0
        , "butik_titel": ""
        , "butik_adresse": ""
        , "butik_by": ""
        , "butik_telefon": 0
        , "butik_email": ""
    }

   

    return data;
}

module.exports = (app) => {
    //index
    app.get('/', (req, res) => {
        (async () => {
            try {
                // let data = await hent_template_data();

                let info = {
                    "info_id": 0
                    , "info_titel": ""
                    , "info_billede": ""
                    , "info_undertitel": ""
                    , "info_teaser": ""
                };

                // await info_service.hent_en()
                //     .then(result => {
                //         info = result;
                //     })

                res.render('pages/index', {
                    "titel": "Index"
                    , "page": "Forsiden"
                    , "kategoriNav": ""
                    , "infomation": info

                    , "fejlbesked": ""
                    , "email": ""
                    , "session": req.session
                    
                    // , "kategorier": data.alle_kategorier
                    
                });

            } catch (error) {
                console.log(error);
            }
        })();
    });
}