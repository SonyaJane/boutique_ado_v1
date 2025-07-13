/*
    https://docs.stripe.com/payments/elements
    https://docs.stripe.com/js/initializing

    CSS from Codeinstitute Boutique Ado project in checkout.css 
  
*/

// 'stripe_publishable_key' is in the context passed from the Django view
const stripePublicKey = $('#id_stripe_public_key').text().slice(1, -1);
const clientSecret = $('#id_client_secret').text().slice(1, -1);

// Initialise Stripe
const stripe = Stripe(stripePublicKey);
// Now use the Stripe object to create an instance of Elements
const elements = stripe.elements();

// https://docs.stripe.com/js/appendix/style
const style = {
    base: {
        iconColor: '#c4f0ff',
        color: '#000',
        fontWeight: '500',
        fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
        ':-webkit-autofill': {
            color: '#fce883',
        },
        '::placeholder': {
            color: '#87BBFD',
        },
    },
    invalid: {
        iconColor: '#FFC7EE',
        color: '#FFC7EE',
    }
};

// Use elements to create an instance of the card Element
const card = elements.create('card', {style: style});

// Add an instance of the card Element into the `card-element` div
// <div class="mb-3" id="card-element"></div> in checkout.html
card.mount('#card-element');

// Handle realtime validation errors on the card element
card.addEventListener('change', function (event) {
    let errorDiv = document.getElementById('card-errors');
    if (event.error) {
        let html = `
            <span class="icon" role="alert">
                <i class="fas fa-times"></i>
            </span>
            <span>${event.error.message}</span>
        `;
        $(errorDiv).html(html);
    } else {
        errorDiv.textContent = '';        
    }
});

// Handle form submit
let form = document.getElementById('payment-form');

form.addEventListener('submit', function(ev) {
    ev.preventDefault();
    card.update({ 'disabled': true});
    $('#submit-button').attr('disabled', true);
    $('#payment-form').fadeToggle(100);
    $('#loading-overlay').fadeToggle(100);
    stripe.confirmCardPayment(clientSecret, {
        payment_method: {
            card: card,
        }
    }).then(function(result) {
        if (result.error) {
            let errorDiv = document.getElementById('card-errors');
            let html = `
                <span class="icon" role="alert">
                <i class="fas fa-times"></i>
                </span>
                <span>${result.error.message}</span>`;
            $(errorDiv).html(html);
            $('#payment-form').fadeToggle(100);
            $('#loading-overlay').fadeToggle(100);            
            card.update({ 'disabled': false});
            $('#submit-button').attr('disabled', false);
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                form.submit();
            }
        }
    });
});