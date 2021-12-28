
var router = new Navigo(null, true, '#!');
var app = document.querySelector('#app');

router.on(function(){
    app.innerHTML= `
    <div class="top_title">Dictionary</div>
    <center id="prg">
    <div class="progress grey">
    <div class="indeterminate red"></div>
</div>
    </center>
    <div class="input-field search">
    <i class="icofont-search-1 prefix"></i>
    <input id="search" name="search" type="text" placeholder="Search word" />

    <div class="dic_header">Recent Search</div>
    <div class="history"></div>
    </div>

    <div class="menu_item">
    <a href="#!/favorites"><div class="menu_logo"><i class="icofont-favourite"></i></div> <div class="menu_title">Favorite Words</div></a>
    </div>
    `
   
    var words;
    db.ref('app/dic/search_history/').on('value', s=>{
        $('#prg').hide();
        let history = document.querySelector('.history');
        history.innerHTML="";
        words = s.val().words;
        for(let i=0; i<words.length; i++){
           
            history.innerHTML += `
                <div class="word_list">
                <a href="#!/search/${words[i]}"><div class="word">${words[i]}</div></a>
                </div>
            `
        }
        document.getElementById('search').addEventListener('keyup', function(event){
            if(event.key === 'Enter'){
                event.preventDefault();

                let s_word = (this.value).toLowerCase();
                let allw = words.join(', ');
                if(!allw.includes(s_word)){
                if(words.length===10){
                    words.pop();
                    words.unshift(s_word);
                }else{
                    words.push(s_word)
                }
                db.ref('app/dic/search_history/').update({words: words});
            }
                router.navigate('/search/'+s_word);
                // console.log(words);
            }
    });
    
    })

   

}).resolve();

router.on({
    "search/:id": function(params){
        
        app.innerHTML= `
    <div class="top_title_screen" onclick="window.history.back()"><i class="icofont-simple-left"></i> <span id="tt">Searching...</span></div>
    <div class="dic_body">
    <center>
    <div class="progress grey">
    <div class="indeterminate red"></div>
</div>
    </center>
    </div>
    <div class="bn_img"></div>`;
    const dic_body = document.querySelector('.dic_body');
        let s_word = params.id;
        // console.log(s_word);
        $(function(){
          $.get('https://api.dictionaryapi.dev/api/v2/entries/en/'+s_word, function(){})
          .done(function(res){
        //   console.log(res);
         $('#tt').text('Search');
              dic_body.innerHTML = `
              <div class="word_head"> <div class="speaker"><i class="icofont-audio"></i> </div> ${s_word} <div class="add_fav"><i class="icofont-favourite"></i></div></div></div>
              <div class="word_prnc">/${res[0].phonetic}/</div>
              <div class="word_def"></div>
              <div class="origin"></div>
              `
              $('.add_fav').hide();

              let audio;
              if(res[0].phonetics.length !== 0){
               audio = new Audio(res[0].phonetics[0].audio);
               
              }else {
                $('.speaker').hide();
                $('.word_prnc').hide();
              }

              $('.speaker').click(function(e){
                  e.preventDefault();
                  audio.play();
              })
              
              let word_def = document.querySelector('.word_def');
              let meanings = res[0].meanings;
              for(let i=0; i<meanings.length; i++){
                      let syn = (res[0].meanings[i].definitions[0].synonyms).join(", ");
                      let ant = (res[0].meanings[i].definitions[0].antonyms).join(", ");

                      if(res[0].meanings[i].definitions[0].synonyms.length === 0 && res[0].meanings[i].definitions[0].antonyms.length !== 0){
                        word_def.innerHTML += `
                        <div class="def_body">
                        <div class="pos">${res[0].meanings[i].partOfSpeech}</div>
                        <div class="def">${res[0].meanings[i].definitions[0].definition}</div>
                        <div class="ex">"${res[0].meanings[i].definitions[0].example}"</div>
                        <div class="syn" id="ant"><span class="dic_text">Antonyms: </span>${ant}</div>
                        </div>
                        `

                      }else if(res[0].meanings[i].definitions[0].antonyms.length === 0 && res[0].meanings[i].definitions[0].synonyms.length !== 0){
                        word_def.innerHTML += `
                    <div class="def_body">
                    <div class="pos">${res[0].meanings[i].partOfSpeech}</div>
                    <div class="def">${res[0].meanings[i].definitions[0].definition}</div>
                    <div class="ex">"${res[0].meanings[i].definitions[0].example}"</div>
                    <div class="syn" id="syn"><span class="dic_text">Synonyms: </span>${syn}</div>
                    </div>
                    `
                    }else if(res[0].meanings[i].definitions[0].antonyms.length === 0 && res[0].meanings[i].definitions[0].synonyms.length === 0){
                        word_def.innerHTML += `
                    <div class="def_body">
                    <div class="pos">${res[0].meanings[i].partOfSpeech}</div>
                    <div class="def">${res[0].meanings[i].definitions[0].definition}</div>
                    <div class="ex">"${res[0].meanings[i].definitions[0].example}"</div>
                    </div>
                    `
                    }
                    else{
                    word_def.innerHTML += `
                    <div class="def_body">
                    <div class="pos">${res[0].meanings[i].partOfSpeech}</div>
                    <div class="def">${res[0].meanings[i].definitions[0].definition}</div>
                    <div class="ex">"${res[0].meanings[i].definitions[0].example}"</div>
                    <div class="syn" id="syn"><span class="dic_text">Synonyms: </span>${syn}</div>
                    <div class="syn" id="ant"><span class="dic_text">Antonyms: </span>${ant}</div>
                    </div>
                    `}
                    if(res[0].meanings[i].definitions[0].example == undefined) $('.ex').html("");
                    
              }
             if(res[0].origin !== undefined){ 
              $('.origin').html(`
              <div class="def_body">
              <div class="org"><b>ORIGIN:</b> ${res[0].origin}</div>
              </div>
              `);}

              



              $('.bn_img').html(`
              <div class="dic_header">Bangla Academy Dictionary</div>
              <div class="img"><img onError="this.onerror=null;this.src='https://cdn.dribbble.com/users/88213/screenshots/8560585/media/7263b7aaa8077a322b0f12a7cd7c7404.png?compress=1&resize=200x200';" src="https://www.english-bangla.com/public/images/words/D${s_word[0]}/${s_word}"/></div>`);
             
              function AddFav(){
              var found = false;
              var keyFound = '';
              db.ref('app/dic/favs').on('value', f=>{
                $('.add_fav').show();
                f.forEach(item=>{
                  if(s_word === item.val().word){
                    found = true;
                    keyFound = item.key;
                    $('.add_fav').css("color", "red");
                  }
                });
             //console.log(keyFound);
                $('.add_fav').off().click(function(e){

                    e.preventDefault();
                    console.log('click');
                    if(found===false){
                      db.ref('app/dic/favs').push({
                          word: s_word,
                          date: (new Date()).toString()
                      });
                      M.toast({html: 'Added to favorite', classes: 'green'});
                      AddFav();
                      return;
                     }else{
                         db.ref('app/dic/favs/'+keyFound).remove();
                        M.toast({html: 'Removed from favorite', classes: 'red'});
                        $('.add_fav').css("color", "#8d8b8b");

                    AddFav();
                    return;
                     }
                    
                });

              });
            }

            AddFav();
              

            }).fail(e=>{
              $('.bn_img').html(``);
              Swal.fire({
               
                icon: 'error',
                title: e.responseJSON.title,
                html: e.responseJSON.resolution,
                showConfirmButton: true,
                timer: 5000
              }).then(r=>{
                  router.navigate('/');
              })
            //   console.log(e.responseJSON);
            });
        });
    },

    "favorites": function(){
        app.innerHTML = `
        <div class="top_title_screen" onclick="window.history.back()"><i class="icofont-simple-left"></i> <span id="tt">Favorites...</span></div>
        <center id="prg">
        <div class="progress grey">
        <div class="indeterminate red"></div>
    </div>
        </center>
        <div id="fav_list"></div>
        <div id="pagination"></div>
        `

        db.ref('app/dic/favs').on('value', f=>{
            $('#tt').text('Favorites');
            $('#prg').hide();
            let data=[];
            let html= [];
            f.forEach(item=>{
              data.push({word: item.val().word, date: item.val().date, key: item.key});
            });

            data.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });
            console.log(data);
            data.forEach(item=>{
                let readyData = `<div class="menu_item"><a href="#!/search/${item.word}"><div class="menu_title">${item.word}</div> <div id="${item.key}" class="action_icon" style="display: none;"><i class="icofont-close"></i></div></a></div>` 
                html.push(readyData);
            });
            console.log(html);
            
            $('#pagination').pagination({
                dataSource: html,
                callback: function(data, pagination) {
                    $('#fav_list').html(data);
                    
                }
            });
            $('.paginationjs-prev').html(`<a><i class="icofont-double-left"></i></a>`);
$('.paginationjs-next').html(`<a><i class="icofont-double-right"></i></a>`);

        });
        
    },

}).resolve();



