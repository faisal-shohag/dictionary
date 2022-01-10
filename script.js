
var router = new Navigo(null, true, '#!');
var app = document.querySelector('#app');

router.on(function(){
    app.innerHTML= `
    <div class="animate__animated animate__fadeIn body">
    <div class="top_title"><div class="w">W</div>ord<div class="cursive">profound</div></div>
    <center id="prg">
    <div class="progress grey">
    <div class="indeterminate red"></div>
</div>
    </center>
    <div class="input-field search">
    <i class="icofont-search-1 prefix"></i>
    <input id="search" name="search" type="text" placeholder="Search English or বাংলা" />

    <div class="dic_header">Recent Searches <a href="#!/history"><div style="display: none;"  class="dic_head_sub">See all</div></a></div>
    <div class="history"></div>
    <div class="histories"></div>
    </div>

    <div class="menu_item">
    <a href="#!/favorites"><div class="menu_logo"><i class="icofont-favourite"></i></div> <div class="menu_title">Favorite Words</div></a>
    </div>
    <div class="menu_item">
    <a href="#!/newspaper"><div class="menu_logo" style="color: #316e0d;background: #41800757;"><i class="icofont-newspaper"></i></div> <div class="menu_title" style="color:#316e0d; display: flex; flex-direction: row; width: 100%; align-items: center; gap: 5px;"><span>News from</span> <img height="20px" src="https://img.thedailystar.net/sites/all/themes/sloth/logo.svg"/></div></a>
    </div>
   <div class="rem"></div>
    `
    db.ref('app/dic/favs').once('value', f=>{
      $('#prg').hide();
      let data=[];
      f.forEach(item=>{
        data.push(item.val().word);
      });
      let randomWord = Math.floor(Math.random()*data.length);
      let randomBackground = Math.floor(Math.random()*15);
      let word = data[randomWord];
      //console.log(data[randomWord]);
      //console.log(gradientColorCode[randomBackground]);
      $('.rem').html(`
      <div style="background:${gradientColorCode[randomBackground]};" class="sug-card animate__animated animate__fadeIn">
      <div class="title-1"><i class="icofont-brainstorming"></i> Remember</div>
      <div class="title-word animate__animated animate__jello">${word}<div style="font-size: 15px" id="bn">(...)</div></div>
      <div class="title-meaning"><center> <div class="preloader-wrapper small active">
      <div class="spinner-layer spinner-green-only">
        <div class="circle-clipper left">
          <div class="circle"></div>
        </div><div class="gap-patch">
          <div class="circle"></div>
        </div><div class="circle-clipper right">
          <div class="circle"></div>
        </div>
      </div>
    </div>
          </center></div>
          <center><a href="#!/search/${word}"><div style="color: #eee;" class="more">more...</div></a></center>
      </div>
 
      </div>
      `);
      $(function(){
        $.get('https://api.dictionaryapi.dev/api/v2/entries/en/'+word, function(){})
        .done(function(res){
         $('.title-meaning').html(`<div class="animate__animated animate__fadeInUp"><i>${res[0].meanings[0].partOfSpeech}</i> - <b>${res[0].meanings[0].definitions[0].definition}</b></div>`);
        }).fail(e=>{
          $('.title-meaning').html(`<div class="animate__animated animate__fadeInUp" style="color: red; text-shadow: 0px 2px 3px rgba(0,0,0,.4);">No defination found!</div>`);
        });
      });

      $(function(){
        $.get('https://api.codetabs.com/v1/proxy?quest=https://www.english-bangla.com/dictionary/'+word, ()=>{})
        .done(res=>{
            let ht = res.split('\n');
            let w ='';
            for(let i=0;i<ht.length; i++){
              if(ht[i].includes('description')){
                w = ht[i];
                break;
              }
            }
            w = w.split('-');
            w = w[1].split('|');
           // console.log(w);
            // if(w[0].includes(';')){
            // w = w[0].split(';');
            // }
            // if(w[0].includes(',')){
            //   w = w[0].split(',');
            //   }
           // console.log(w[0]);
            $('#bn').text('['+w[0]+']');
        })
      });
      
    });
   
    var words;
    db.ref('app/dic/search_history/').on('value', s=>{
        $('#prg').hide();
        let history = document.querySelector('.history');
        history.innerHTML="";
        words = s.val().words;
        for(let i=0; i<words.length; i++){
          let res = /^[a-zA-Z]+$/.test(words[i]);
            if(res)
            history.innerHTML += `
                <div class="word_list">
                <a href="#!/search/${words[i]}"><div class="word">${words[i]}</div></a>
                </div>
            `
            else 
            history.innerHTML += `
            <div class="word_list">
            <a href="#!/search_bangla/${words[i]}"><div class="word">${words[i]}</div></a>
            </div>
        `
        }
        document.getElementById('search').addEventListener('keyup', function(event){
            if(event.key === 'Enter') {
                event.preventDefault();
                let s_word = (this.value).toLowerCase();
                let allw = words.join(', ');
                if(!allw.includes(s_word)){
                if(words.length===10){
                    words.pop();
                    words.unshift(s_word);
                }else{
                    words.push(s_word);
                }
                db.ref('app/dic/search_history/').update({words: words});
            }
            let res = /^[a-zA-Z]+$/.test(s_word);
            if(res) router.navigate('/search/'+s_word);
            else router.navigate('/search_bangla/'+s_word);
         }
      });
    });
}).resolve();

router.on({
    "search/:id": function(params){  
      $('.selected_modal').removeClass('animate__bounceOutUp');
  $('.selected_modal').addClass('animate__bounceOutDown');
      if (document.contains(document.getElementById("share-snippet"))) {
        document.getElementById("share-snippet").remove();
    }
        app.innerHTML= `
        <div class="animate__animated animate__fadeInUp body">
    <div class="top_title_screen" onclick="window.history.back()"><i class="icofont-simple-left"></i> <span id="tt">Searching...</span></div>
    <div class="dic_body">
    <center id="prg">
    <div class="progress grey">
    <div class="indeterminate red"></div>
</div>
    </center>
    </div>
    <div class="bn_img"></div>
    </div>`;
    const dic_body = document.querySelector('.dic_body');
        let s_word = params.id;

        $(function(){
          $.get('https://api.dictionaryapi.dev/api/v2/entries/en/'+s_word, function(){})
          .done(function(res){
         // console.log(res);
         $('#tt').text('Search');
              dic_body.innerHTML = `
              <div class="word_head"> <span id="not_found"><div id="word_speak"  class="speaker"><i class="icofont-audio"></i> </div></span> ${s_word} <div class="add_fav"><i class="icofont-favourite"></i></div></div></div>
              <div class="word_prnc">/${res[0].phonetic}/</div>
              <div class="word_def"></div>
              <div class="origin"></div>
              `
              
              $('.add_fav').hide();
              let audio;
              if(res[0].phonetic !== undefined){
               audio = new Audio(res[0].phonetics[0].audio);

               $('#word_speak').click(function(e){
                e.preventDefault();
                audio.play();
            })
               
              }else {
                $('#word_speak').hide();
                $('.word_prnc').hide();
                $('#not_found').html(`<div id="word_speak" onclick="responsiveVoice.speak('${s_word}')"  class="speaker"><i class="icofont-audio"></i> </div>`)
              }
              
              let word_def = document.querySelector('.word_def');
              let meanings = res[0].meanings;
              for(let i=0; i<meanings.length; i++){
                      let syn = (res[0].meanings[i].definitions[0].synonyms).map(e=> "<a href='#!/search/"+ e + "'>"+e).join("</a>, ");
                      syn += "</a>"
                      let ant = (res[0].meanings[i].definitions[0].antonyms).map(e=> "<a href='#!/search/"+ e + "'>"+e).join("</a>, ");
                      ant += "</a>"
                      
                      let pos = res[0].meanings[i].partOfSpeech;
                      let p = pos.substring(1, pos.length);
                      pos = pos[0].toUpperCase() + p;

                      if(res[0].meanings[i].definitions[0].synonyms.length === 0 && res[0].meanings[i].definitions[0].antonyms.length !== 0){
                        word_def.innerHTML += `
                        <div class="def_body">
                        <div class="pos">${pos}</div>
                        <div class="def">${res[0].meanings[i].definitions[0].definition} <div onclick="responsiveVoice.speak('${res[0].meanings[i].definitions[0].definition}')" class="speaker"><i class="icofont-audio"></i></div></div>
                        <div class="ex">"${res[0].meanings[i].definitions[0].example}"</div>
                        <div class="syn" id="ant"><span class="dic_text">Antonyms: </span>${ant}</div>
                        </div>
                        `

                      }else if(res[0].meanings[i].definitions[0].antonyms.length === 0 && res[0].meanings[i].definitions[0].synonyms.length !== 0){
                        word_def.innerHTML += `
                    <div class="def_body">
                    <div class="pos">${pos}</div>
                    <div class="def">${res[0].meanings[i].definitions[0].definition} <div onclick="responsiveVoice.speak('${res[0].meanings[i].definitions[0].definition}')" class="speaker"><i class="icofont-audio"></i></div></div>
                    <div class="ex">"${res[0].meanings[i].definitions[0].example}"</div>
                    <div class="syn" id="syn"><span class="dic_text">Synonyms: </span>${syn}</div>
                    </div>
                    `
                    }else if(res[0].meanings[i].definitions[0].antonyms.length === 0 && res[0].meanings[i].definitions[0].synonyms.length === 0){
                        word_def.innerHTML += `
                    <div class="def_body">
                    <div class="pos">${pos}</div>
                    <div class="def">${res[0].meanings[i].definitions[0].definition} <div onclick="responsiveVoice.speak('${res[0].meanings[i].definitions[0].definition}')" class="speaker"><i class="icofont-audio"></i></div></div>
                    <div class="ex">"${res[0].meanings[i].definitions[0].example}"</div>
                    </div>
                    `
                    }
                    else{
                    word_def.innerHTML += `
                    <div class="def_body">
                    <div class="pos">${res[0].meanings[i].partOfSpeech}</div>
                    <div class="def">${res[0].meanings[i].definitions[0].definition} <div onclick="responsiveVoice.speak('${res[0].meanings[i].definitions[0].definition}')" class="speaker"><i class="icofont-audio"></i></div></div>
                    <div class="ex">"${res[0].meanings[i].definitions[0].example}"</div>
                    <div class="syn" id="syn"><span class="dic_text">Synonyms: </span>${syn}</div>
                    <div class="syn" id="ant"><span class="dic_text">Antonyms: </span>${ant}</div>
                    </div>
                    `}
                    if(res[0].meanings[i].definitions[0].example == undefined) $('.ex').html("");
                    
              }
             if(res[0].origin !== undefined){ 
                 let v = (res[0].origin). replace(/'/g,'');
                 console.log(v);
              $('.origin').html(`
              <div class="def_body">
              <div class="org"><b>ORIGIN:</b> ${res[0].origin} <div onclick="responsiveVoice.speak('${v}')" class="speaker"><i class="icofont-audio"></i></div>
              </div>
              `)}
              $('.bn_img').html(`
              <div class="dic_header">Bangla Academy Dictionary</div>
              <div class="img"><img onError="this.onerror=null;this.src='https://cdn.dribbble.com/users/88213/screenshots/8560585/media/7263b7aaa8077a322b0f12a7cd7c7404.png?compress=1&resize=200x200';" src="https://www.english-bangla.com/public/images/words/D${s_word[0]}/${s_word}"/></div>`);
            AddFav(s_word);
            }).fail(e=>{
              $('.bn_img').html(``);
              bnAc(s_word);
            });
        });
    },
    "search_bangla/:id": function(params){
      $('.selected_modal').removeClass('animate__bounceOutUp');
      $('.selected_modal').addClass('animate__bounceOutDown');
          if (document.contains(document.getElementById("share-snippet"))) {
            document.getElementById("share-snippet").remove();
        }
            app.innerHTML= `
            <div class="animate__animated animate__fadeInUp body">
        <div class="top_title_screen" onclick="window.history.back()"><i class="icofont-simple-left"></i> <span id="tt">সার্চিং...</span></div>
        <div class="dic_body">
        <center id="prg">
        <div class="progress grey">
        <div class="indeterminate red"></div>
    </div>
        </center>
        </div>
        <div class="bn_img"></div>
        </div>`;
        const dic_body = document.querySelector('.dic_body');
        let s_word = params.id;
       
        $(function(){
        $.get('https://api.allorigins.win/get?url=https://www.edictionarybd.com/dictionary/b2e/'+s_word[0]+'/'+s_word+'.php', ()=>{})
        .done(res=>{
          $('#tt').text('সার্চ');
          $('#prg').hide();
          let body = res.contents.split('/');
          //console.log(body);
          let m = '';
          for(let i=0; i<body.length; i++){
            if(body[i].includes(s_word+' Meaning:')){
              m=body[i+1];
              break;
            }
          }
          m = m.split('>');
          m = m[1].split('<');
          m = m[0].split(']');
          let pos = m[0];
          pos = pos.split('[')[1];
          m = m[1].split(';');
          m = m.join("");
          m = m.split(".");
          m = m[0].split(" ");
         

          dic_body.innerHTML = `
          <div class="word_head"> <span id="not_found"></span> ${s_word} <div style="display: none;" class="add_fav"><i class="icofont-favourite"></i></div></div></div>
          <div class="word_prnc"></div>
          <div class="def_body">
                        <div class="pos">${pos}</div>
                        <div class="def bnen"></div>
                        </div>
          `
          const bnen = document.querySelector('.bnen');
          bnen.innerHTML='';
          for(let i=0; i<m.length; i++){
           if(m[i]!=''){
              bnen.innerHTML+=`
             <a href="#!/search/${m[i].toLowerCase()}">${m[i].toLowerCase()}</a>
              `
              if(m.length-1!=i) bnen.innerHTML+=',';
            }
            
          }
        }).fail(e=>{
          Swal.fire({
            icon: 'error',
            title: 'Not Found any Word',
            html: 'This may cause because of typo!',
            showConfirmButton: true,
            timer: 5000
         }).then(r=>{
                router.navigate('/');
            });
        })
      });



    },
    "favorites": function(){
        app.innerHTML = `
        <div class="animate__animated animate__fadeIn body">
        <div class="top_title_screen" onclick="window.history.back()"><i class="icofont-simple-left"></i> <span id="tt">Favorites...</span></div>
        <div class="option_menu">
        <div id="sbl" class="option_item"><i class="icofont-font"></i> Sort by Letter</div>
        <div id="sbt" class="option_item"><i class="icofont-calendar"></i> Sort by Time</div>
        </div>
        <center id="prg">
        <div class="progress grey">
        <div class="indeterminate red"></div>
    </div>
        </center>
        <div id="fav_list"></div>
        <div id="pagination"></div>
        </div>
        `
        db.ref('app/dic/favs').once('value', f=>{
            $('#prg').hide();
            let data=[];
            f.forEach(item=>{
              data.push({word: item.val().word, date: item.val().date, key: item.key});
            });
            $('#tt').text('Favorites('+data.length+')');
            sortByTime(data);
            
            $('.option_item').click(function(e){
                e.preventDefault();
               let id = $(this)[0].id;
               if(id==="sbt") sortByTime(data);
               if(id==="sbl") sortByLetter(data);
            });
            
        });   
    },

    "history":function(){
        $('.histories').show();
        $('.dic_head_sub').html(`<span class="red-text"><i class="icofont-close"></i></span>`);
        $('.dic_head_sub').addClass('animate_animated animate__bounceIn');
        $('.histories').addClass("animate__animated animate__fadeInUp");
        $('.dic_head_sub').click(function() {
             console.log('back!');
             $('.histories').addClass("animate__animated animate__fadeOutDown");
             $('.dic_head_sub').html(`See All`);
             $('.dic_head_sub').addClass('animate_animated animate__fadeInRight');
           });
    },
    "newspaper": function(){
      app.innerHTML = `
      <div class="animate__animated animate__fadeIn body">
      <div class="top_title_screen" onclick="window.history.back()"><i class="icofont-simple-left"></i> <span id="tt">News...</span></div>
      <center id="prg">
        <div class="progress grey">
        <div class="indeterminate red"></div>
    </div>
        </center>
      <div class="news_list"></div>
      </div>
      `
        $(function(){
            $.get('https://api.allorigins.win/get?url=https://www.thedailystar.net/top-news', ()=>{})
            .done(res=>{
              $('#tt').text('News');
              $('#prg').hide();
              const nw = document.querySelector('.news_list');
              nw.innerHTML='';
            let news = res.contents.split('\n');
            let line = 0;
            //console.log(news);
            for(let i=0; i<news.length; i++){
              if(news[i].includes('top-news-ticker-runner')){
                line = i;
                break;
              }
            }
            let headlines = news[line+1].split('</a>');
            for(let i=0; i<headlines.length-1; i++){
              let a = headlines[i].split('>');
              let b = a[0].split('"');
              //console.log(b[1]);
              b = b[1].split('/');
              b = b.join('~');
              if(a[1].includes('Pori Moni')) continue;
              if(a[1].length>0){
               let c = a[1].replace('%', '~');
              nw.innerHTML +=`
              <div class="menu_item nw">
              <a href="#!/newsparse/${b}/${c}"><div class="menu_logo" style="color: #316e0d;background: #fff; padding: 5px; height: 25px width: 25px; border-radius: 50%; border: 1px solid #eee;"><img height="25px" src="https://img.thedailystar.net/sites/default/files/styles/small_201/public/default_fallback.jpg"/></div> <div class="menu_title" style="color:#316e0d; font-size: 14px; font-family: 'Copyright Klim Type Foundry';">${a[1]}</div></a>
              </div>`;
            }
            }
            }).fail(e=>{
              
            });

         });
            
    },
    "/newsparse/:id/:title":function(params){
      console.log(params.id);
      let id = (params.id).split('~');
      id = id.join('/');
      let title = params.title;
      title = title.replace('~', '%');
      app.innerHTML = `
      <div class="animate__animated animate__fadeIn body">
      <div class="top_title_screen" onclick="window.history.back()"><i class="icofont-simple-left"></i> <span id="tt">News...</span></div>
      <center id="prg">
        <div class="progress grey">
        <div class="indeterminate red"></div>
    </div>
        </center>
        <div class="newsbody">
       <center>
       <div class="preloader-wrapper active">
       <div class="spinner-layer spinner-green-only">
         <div class="circle-clipper left">
           <div class="circle"></div>
         </div><div class="gap-patch">
           <div class="circle"></div>
         </div><div class="circle-clipper right">
           <div class="circle"></div>
         </div>
       </div>
     </div>
       </center> 
        </div>
      </div>
      `
      const newsbody = document.querySelector('.newsbody');
      $(function(){
        $.get('https://api.allorigins.win/get?url=https://www.thedailystar.net'+id, ()=>{})
        .done(res=>{
          $('#tt').text('News');
          $('#prg').hide();
          let news = res.contents.split('\n');
          let s=0;
          let e=0;
          let img='';
          for(let i=0; i<news.length; i++){
            if(news[i].includes('data-exthumbimage')) img = news[i];
            if(news[i].includes('section-content margin-lr pt-20 pb-20 clearfix')){
              s=i;
            }
            if(news[i].includes('mb-20 mr-20 hide-for-print dfp-tag-wrapper text-center')) e=i;
          }
          img = img.split('"');
          newsbody.innerHTML=`<div class="news_title"><i class="icofont-news"></i> ${title}</div><div class="news_image"><img src="${img[5]}"/></div>`;
          for(let i=s; i<e; i++){
            newsbody.innerHTML += `
            ${news[i]}
            `
          }
        })
      });
    }

}).resolve();



function AddFav(s_word){
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
        //   console.log('click');
          if(found===false){
            db.ref('app/dic/favs').push({
                word: s_word,
                date: (new Date()).toString()
            });
            M.toast({html: 'Added to favorite', classes: 'green'});
            responsiveVoice.speak('Added to favorite!');
            AddFav(s_word);
            return;
           }else{
               db.ref('app/dic/favs/'+keyFound).remove();
              M.toast({html: 'Removed from favorite', classes: 'red'});
              responsiveVoice.speak('Removed from favorite');
              $('.add_fav').css("color", "#8d8b8b");

          AddFav(s_word);
          return;
           }
          
      });
    });
  }

  function DateSet(date){
      let d = date;
      d = d.split(' ');
      d = d[2] + ' ' + d[1] + ' ' + d[3] + ' at ' + d[4];
      return d;
  }

//   DateSet()

  function getRelativeTime(date) {
    const d = new Date(date);
    return moment(d).fromNow();
  }

  function sortByTime(data){
    let html= [];
    data.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    data.forEach(item=>{
        let readyData = `<a href="#!/search/${item.word}"><div class="menu_item_no_action"> <div class="dic_row"><div class="menu_title">${item.word}</div> <div class="dic_time">${getRelativeTime(item.date)}</div></div><div class="dic_date">${DateSet(item.date)}</div></div></a>` 
        html.push(readyData);
    });

    $('#pagination').pagination({
        dataSource: html,
        pageSize: 15,
        callback: function(data, pagination) {
            $('#fav_list').html(data);
            
        }
    });
    $('.paginationjs-prev').html(`<a><i class="icofont-double-left"></i></a>`);
$('.paginationjs-next').html(`<a><i class="icofont-double-right"></i></a>`);

  }

  function sortByLetter(data){
    let html= [];
    data.sort((a, b) => {
        return a.word.toUpperCase().localeCompare(b.word.toUpperCase());
    });

    data.forEach(item=>{
        let readyData = `<a href="#!/search/${item.word}"><div class="menu_item_no_action"> <div class="dic_row"><div class="menu_title">${item.word}</div> <div class="dic_time">${getRelativeTime(item.date)}</div></div><div class="dic_date">${DateSet(item.date)}</div></div></a>` 
        html.push(readyData);
    });

    $('#pagination').pagination({
        dataSource: html,
        pageSize: 15,
        callback: function(data, pagination) {
            $('#fav_list').html(data);
            
        }
    });
    $('.paginationjs-prev').html(`<a><i class="icofont-double-left"></i></a>`);
$('.paginationjs-next').html(`<a><i class="icofont-double-right"></i></a>`);

  }


  function bnAc(s_word){
    $(function(){
        $.get('https://api.codetabs.com/v1/proxy?quest=https://www.english-bangla.com/dictionary/'+s_word, ()=>{})
        .done(res=>{
            let ht = res.split('\n');
            ht = ht[7].split('|');
            ht = ht[0].split('"');
           // console.log(ht[3]);
          //  let meaning = ht[3].split(';');
            if(ht[3].includes('Providing the maximum meaning of a word by combining the best sources with us.')){
                //console.log('Not Found');
                  Swal.fire({
                    icon: 'error',
                    title: 'Not Found any Word',
                    html: 'This may cause because of typo!',
                    showConfirmButton: true,
                    timer: 5000
                 }).then(r=>{
                        router.navigate('/');
                    });
    //console.log(e.responseJSON);
            }else{
                $('#prg').hide();
                app.innerHTML = `
                <div class="animate__animated animate__fadeInUp body">
                <div class="top_title_screen" onclick="window.history.back()"><i class="icofont-simple-left"></i> <span id="tt">Search</span></div>
                <div class="word_head"> ${s_word} <div class="add_fav"><i class="icofont-favourite"></i></div></div></div>
                  <div style="margin-top: 30px;" class="def_body">
                  <div class="def">${ht[3]}</div>
                  </div></div>
                `

                AddFav(s_word);
            }
        })
    })
  
  }







function getSelectionText() {
  var text = "";
  if (window.getSelection) {
      text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") { // for Internet Explorer 8 and below
      text = document.selection.createRange().text;
  }
  return text;
}


$('div').on('change mouseup mousedown keydown',function(){
let sl = getSelectionText();

if(sl.length>1 && sl.length<18){
  $('.selected_modal').show();
  $('.selected_modal').removeClass('animate__bounceOutDown');
  $('.selected_modal').addClass('animate__animated animate__bounceInUp animate__faster');
  $('.selected_modal').html(`
  <div class="close cl"><i class="icofont-close"></i></div>
  <div class="modal_sl_title animate__animated animate__fadeIn">${sl}</div>
  <div class="meaning"></div>
  <center><a href="#!/search/${sl}"><div class="more">more..</div></a></center>
  `);

 

  $(function(){
    $.get('https://api.dictionaryapi.dev/api/v2/entries/en/'+sl, function(){})
    .done(function(res){
     $('.meaning').html(`<div class="animate__animated animate__fadeInUp"><i>${res[0].meanings[0].partOfSpeech}</i> - <b>${res[0].meanings[0].definitions[0].definition}</b></div>`);
    });
  });
 
}
$('.cl').click(function(){
  console.log('CLOSE');
  $('.selected_modal').removeClass('animate__bounceOutUp');
  $('.selected_modal').addClass('animate__bounceOutDown');
  
});

});


var gradientColorCode={
  0:"linear-gradient(to right, #2c3e50, #fd746c);",
  1:"linear-gradient(45deg, #310e91, #8869dd);",
  2:"linear-gradient(to right, #2c3e50, #4ca1af);", 
  3:"linear-gradient(to top, #e96443, #904e95);",
  4:"linear-gradient(to left, #3a7bd5, #3a6073);",
  5:"linear-gradient(to left, #00d2ff, #928dab);",
  6:"linear-gradient(to bottom, #2196f3, #f44336);",
  7:"linear-gradient(to bottom, #ff5f6d, #ffc371);",
  8:"linear-gradient(to top, #16bffd, #cb3066);",
  9:"linear-gradient(to top, #eecda3, #ef629f);",
  10:"linear-gradient(to top, #000000, #434343);",
  11:"linear-gradient(to top, #4b79a1, #283e51);",
  12:"linear-gradient(to top, #1e3c72, #2a5298);",
  13:"linear-gradient(to bottom, #6a3093, #a044ff); ",
  14:"linear-gradient(to bottom, #7b4397, #dc2430);"
}
