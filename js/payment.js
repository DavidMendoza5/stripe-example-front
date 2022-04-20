const stripe = Stripe('pk_test_51KgAzrJy0x77db5EWJAfcNsYxXEqFJSfybgwEzTpKRVG2oVVgwcjFZkwnMEiJm1gf0oOl6km4ImvuTyym1FRU4IN005Pa1bYYT');
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

document.addEventListener('DOMContentLoaded', async () => {

  const form = document.querySelector('#payment-form');

  form.addEventListener('submit', createPayment);
})

async function createPayment(e) {
  e.preventDefault();

  const spinner = document.querySelector('#spinner');
  spinner.style.display = 'flex';

  const description = document.querySelector('#description');
  const amount = document.querySelector('#amount');

  const response = await axios.post('http://localhost:4000/stripe', {
    paymentMethodType: 'card',
    currency: 'usd',
    amount: Number(amount.value),
    description: description.value,
  });

  await confirmPayment(response.data.client_secret,);
  spinner.style.display = 'none';
}

function verifyCaptcha() {
  const response = grecaptcha.getResponse();

  if(response.length == 0){
    alert("Captcha no verificado")
  } else {
    const btn = document.getElementById('submit');
    btn.disabled = false;
  }
}

async function confirmPayment(clientSecret) {
  try {
    const nameInput = document.querySelector('#name');
    const emailInput = document.querySelector('#email');

    const {paymentIntent, error: stripeError} = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: nameInput.value,
            email: emailInput.value,
          },
        },
      }
    )
    if(stripeError) {
      addMessage(stripeError.message);
      resetForm();
      return;
    }

    addMessage(`PaymentIntent ${paymentIntent.status}`);
    resetForm();
  } catch (error) {
    console.log(error);
  }
}

function resetForm() {
  const form = document.querySelector('#payment-form');
  form.removeChild(form.children[10]);
  form.reset();

  cardElement.unmount('#card-element');
  const newCardDiv = document.createElement('div');
  newCardDiv.id = 'card-element';
  form.insertBefore(newCardDiv, form.children[10]);
  cardElement.mount('#card-element');
}

const addMessage = (message) => {
  const message_div = document.querySelector('#card-errors');
  message_div.innerHTML = '';
  message_div.style.display = 'block';
  message_div.innerHTML += message + '<br>';
}