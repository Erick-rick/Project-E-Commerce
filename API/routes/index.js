const router = require("express").Router();

router.use('/v1/api', require('')); //V1- pq toda api tem versões que possa ser alterada e n quebra o sistema
router.get('/', (req, res, nest) => res.send({ ok: true }));

router.use(function(err, req, res, next){
    //para quando tiver algum erro, e identificar o erro 
    if(err.name === 'ValidationError'){
        return res.status(422).json({
            errors: Object.keys(err.errors).reduce(function(errors, key){
                errors[key] = err.errors[key.message];
                return errors;
            }, {})
        });
    }
});

module.exports = router;