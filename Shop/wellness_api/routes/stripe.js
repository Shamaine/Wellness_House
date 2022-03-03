const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);

router.post("/payment", (req, res) => {
  //Create a charge
  stripe.charges.create(
    {
      //when we make a payment, stripe return a token Id
      source: req.body.tokenId,
      amount: req.body.amount,
      currency: "MYR",
    },
    (stripeErr, stripeRes) => {
      if (stripeErr) {
        res.status(500).json(stripeErr);
      } else {
        res.status(200).json(stripeRes);
      }
    }
  );
});

module.exports = router;
