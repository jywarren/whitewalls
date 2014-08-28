$W = {
  pointer_x: 0,
  pointer_y: 0,
  layer_id: 0, // 0 indicates no layer edits made yet
  layer_ids: [],
  initialize: function() {
    $W.element = $('#canvas')
    $('body').mouseup($W.on_mouseup)
    $W.element.mousedown($W.on_mousedown)
    $W.element.mousemove($W.on_mousemove)
    $W.element = $('#canvas')[0]
    $W.element.addEventListener('touchend',$W.on_mouseup)
    $W.element.addEventListener('touchstart',$W.on_mousedown)
    $W.element.addEventListener('touchmove',$W.on_mousemove)
    $W.width = 1024 //$('body').width
    $W.height = 768 //$('body').height
    $W.element.width = $W.width
    $W.element.height = $W.height
    $W.canvas = $W.element.getContext('2d');
    $C = $W.canvas
    setInterval($W.update,500)
  },

  on_mouseup: function(e) {
    e.preventDefault()
    $W.mousedown = false
    $W.pointer_x = false
    $W.pointer_y = false
    $W.save()
    $('#cursor').css('display','none')
  },

  on_mousedown: function(e) {
    e.preventDefault()
    $W.mousedown = true
    $('#cursor').css('display','block')
  },

  on_mousemove: function(e) {
    e.preventDefault()
    e.stopPropagation();
    $W.old_x = $W.pointer_x
    $W.old_y = $W.pointer_y

    if ($W.mousedown) {
      $C.strokeStyle = "#000"
      $C.lineWidth = 2
      if (e.touches && (e.touches[0] || e.changedTouches[0])) {
        var touch = e.touches[0] || e.changedTouches[0];
        $W.pointer_x = touch.pageX
        $W.pointer_y = touch.pageY
      } else {
        $W.pointer_x = e.pageX - (($('html').width()-$('body').width())/2)
        $W.pointer_y = e.pageY
      }
      $C.beginPath()
      if ($W.old_x) $C.moveTo($W.old_x,$W.old_y)
      else $C.moveTo($W.pointer_x,$W.pointer_y)
      $C.lineTo($W.pointer_x,$W.pointer_y)
      $C.stroke()
    }
    $('#cursor').css('top',($W.pointer_y-4))
    $('#cursor').css('left',($W.pointer_x-4) + (($('html').width()-$('body').width())/2)
)
  },

  save: function() {
    $.post("/panel/save/"+Page.id,
      {
        img: $W.excerpt(),
        layer_id: $W.layer_id
      },
      function(data){
        $W.layer_id = data.split('/')[0]
        $W.layer_ids = data.split('/')[1].split(',')
      })
  },

  update: function() {
    // check if new data?
    $.get('/panel/'+Page.id+'/layers',
      {'last': $W.last_update},
      function(data) {
        $W.layer_ids = data.split('/')[1].split(',')
        if ($W.layer_ids == "") $W.layer_ids = []
        else $W.last_update = data.split('/')[0] // only change last update if there's been new data
    })
    $.each($W.layer_ids,function(i,layer_id) {
      $.post('/layer/'+layer_id,
        {},
        function(data){
          // check if layer exists yet, create it if not
          if ($('#layer_'+layer_id).length == 0) $('#layers').append('<img id="layer_'+layer_id+'" />')
          // add the new image data
          $('#layer_'+layer_id)[0].src = data
        }
      )
    })
  },

  excerpt: function() {
    return $W.excerptCanvas(0,0,$W.width,$W.height,$W.canvas)
  },

  /**
   * Returns a dataURL string of any rect from the offered canvas
   */
  excerptCanvas: function(x1,y1,x2,y2,source) {
    source = source || $C
    var width = x2-x1, height = y2-y1
    $('body').append("<canvas style='' id='excerptCanvas'></canvas>")
    var element = $('#excerptCanvas')[0]
    element.width = width
    element.height = height
    var excerptCanvasContext = element.getContext('2d')
    var sourcedata = source.getImageData(x1,y1,width,height)
    excerptCanvasContext.putImageData(sourcedata,0,0)
    return excerptCanvasContext.canvas.toDataURL()
  }

}

