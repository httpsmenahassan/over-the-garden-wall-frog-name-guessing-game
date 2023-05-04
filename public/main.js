const guessFrogNameBtn = document.getElementsByClassName("guessFrogNameBtn");
const trash = document.getElementsByClassName("fa-trash");

Array.from(guessFrogNameBtn).forEach(function(button) {
      button.addEventListener('click', function(){
        // button has data-nameId attribute which is the same as the ._id in mongo
        const nameId = button.dataset.nameid
        console.log(nameId, button)
        // now we're using that nameId to get the input for the guess 
        const nameInput = document.getElementById(nameId)
        // need to send two things to the server: if the guess is right
        fetch('/names', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            nameId: nameId,
            guess: nameInput.value,
            
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});

Array.from(trash).forEach(function(trashIcon) {
  trashIcon.addEventListener('click', function(){
    const nameId = trashIcon.dataset.nameid
        fetch('/names', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nameId: nameId,
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});
