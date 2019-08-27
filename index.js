/**
 * Created by whd on 2019-08-26.
 * <249605509@qq.com>
 * how to use:
 // 第一次调用
 // $('div').circleProcess({
  //   value: .5,
  //   lineCap: 'round',
  //   thickness: 14,
  //   fontStyle: {
  //     size: '24px',
  //     color: '#fff',
  //     fontFamily: 'SimSun'
  //   },
  //   emptyFill: '#eee',
  //   fillColor: 'red',
  //   bgFill: 'green',
  //   animationTime: 1000,
  //   animationType: 'ease-in'
  // })
 //
 // //再次调用
 // setTimeout(function () {
  //   $('div').circleProcess('change', .3)
  // }, 3000)
 *
 */
(function ($) {

  function CircleProgress(config) {
    this.init(config)
  }

  CircleProgress.prototype = {
    constructor: CircleProgress,
    el: null, //绑定元素
    radius: 100,  //大圆半径
    thickness: 'auto', //轨道宽度
    lineCap: 'butt', //butt , round, square 进度条两端样式
    fontStyle: {
      size: '24px',
      color: '#000',
      fontFamily: 'SimSun'
    },  //字体
    emptyFill: '#666', // 轨道颜色
    fillColor: '#3bb9ef', //进度条颜色
    bgFill: '#fff', // 小圆背景色
    fillGradient: null, // 进度条渐变设置 ['#3aeabb', '#fdd250']
    animationType : 'linear', //动画运动函数 linear ease-in ease-out ease-in-out
    animationTime: 1000, //动画时间

    init: function(config) {

      $.extend(this, config)
      this.canvasSize = 2 * this.radius
      this.initWidget();
      this.getFill();
      this.drawEmptyCircle();

      this.drawAnimated(0);
      this.drawText(0)
    },
    /**
     * @protected
     */
    initWidget: function () {
      var canvas = this.canvas = this.canvas ? this.canvas : $('<canvas></canvas>').prependTo(this.el)[0]
      canvas.width = this.canvasSize;
      canvas.height = this.canvasSize;

      this.ctx = canvas.getContext('2d')
    },
    /**
     * @protected
     */
    drawEmptyCircle: function () {
      var ctx = this.ctx,
        r = this.radius,
        t = this.getThickness();
      r = r - t
      ctx.beginPath();
      ctx.arc(this.radius, this.radius, r, 0, Math.PI*2)
      ctx.lineWidth = t;
      ctx.lineCap = this.lineCap
      ctx.strokeStyle = this.emptyFill;
      ctx.fillStyle = this.bgFill
      // ctx.webkitImageSmoothingEnabled = true;
      // ctx.mozImageSmoothingEnabled = true;
      // ctx.imageSmoothingEnabled = true;
      ctx.fill()
      ctx.stroke()
    },
    /**
     * @protected
     */
    drawProcessCircle: function(v) {
      var ctx = this.ctx,
        t = this.getThickness(),
        r = this.radius - t;

      ctx.beginPath();
      ctx.arc(this.radius, this.radius, r, -Math.PI/2, Math.PI*2*v - Math.PI/2)
      ctx.lineWidth = t;
      ctx.lineCap = this.lineCap
      ctx.strokeStyle = this.arcFill;
      ctx.stroke()

    },
    /**
     * @protected
     */
    drawText: function(v) {
      var ctx = this.ctx;
      v = (v*100).toFixed(2)

      ctx.font = this.fontStyle.size + ' ' + this.fontStyle.fontFamily;
      ctx.fillStyle = this.fontStyle.color;
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(v + '%', this.radius, this.radius)
    },
    /**
     * @protected
     */
    drawFrame: function(v) {
      this.drawEmptyCircle()
      if (this.value > 0) {
        this.drawProcessCircle(v)
        this.drawText(v)
      }
    },
    /**
     * @param {number} v Frame value
     * @param {Boolean} isDrop Judge increase or decrease
     * @protected
     */
    drawAnimated: function(v, isDrop) {
      var df1 = 0.005, df2 = 0.01, self = this;
      if (isDrop) {
        df1 = -0.005
        df2 = -0.01
      }
      v = v || 0
      if (this.animationType === 'ease-in') {
        if (v < this.value * 1/4) {
          v += df1
        } else {
          v += df2
        }
      } else if (this.animationType === 'ease-in-out') {
        if (v <this.value * 1/4 || v > this.value * 3/4) {
          v += df1
        } else {
          v += df2
        }
      } else if (this.animationType === 'ease-out') {
        if (v > this.value * 3/4) {
          v += df1
        } else {
          v += df2
        }
      } else {
        v += df2
      }
      this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize)
      this.drawFrame(v)

      if ( (!isDrop && v < this.value) || (isDrop && v > this.value)) {
        setTimeout(function () {
          self.drawAnimated(v, isDrop)
        }, this.animationTime / 80)
      }

      if ((!isDrop && v >= this.value) || (isDrop && v <= this.value)) {
        this.nextStartVal = this. value
      }
    },

    /***
     * change current Frame value
     * @param {number} v Frame value
     */

    changeProcess: function(v) {
      if (v === this.nextStartVal) return
      this.value = v
      this.getFill()
      this.drawAnimated(this.nextStartVal, v < this.nextStartVal)
    },
    /**
     * this fun set circleprocess.arcFill
     * @protected
     */
    getFill() {
      if (this.fillColor) this.arcFill = this.fillColor
      if (this.fillGradient) {
        var gr = this.fillGradient;
        if (!$.isArray(gr)) {
          throw Error ('the fillGradient must is Array')
        }

        if (gr.length === 1) {
          this.arcFill = gr[0]
        } else if (gr.length > 1) {
          var ga = Math.PI*2*this.value - Math.PI/2, r = this.radius,
            x0 = this.radius, y0 = 0, x1 = r + r * Math.cos(ga), y1 = r + r * Math.sin(ga)
          if (this.value == 1) {
            x1 = this.radius
            y1 = 2 * this.radius
          }
          var lg = this.ctx.createLinearGradient(x0, y0, x1, y1)

          for (var i = 0; i < gr.length; i ++) {
            lg.addColorStop(i/gr.length, gr[i])
          }
          this.arcFill = lg
        }
      }

    },
    /**
     * @protected
     */
    getThickness: function() {
      return !isNaN(this.thickness) ? this.thickness : this.radius / 7
    },


  }

  $.fn.circleProcess = function (config, v) {
    var dataName = 'circle-process';



    return this.each(function () {
      var el = $(this),
        instance = el.data(dataName),
        cfg = $.isPlainObject(config) ? config : {};
      if (config === 'change') {
        return instance && instance.changeProcess(v)
      }
      if (instance) {
        instance.init(cfg)
      } else {
        cfg.el = el
        instance = new CircleProgress(cfg)

        el.data(dataName, instance)
      }
    })
  }

  if (typeof define === 'function') {
    module.exports = CircleProgress
  } else if (typeof exports !== 'undefined') {
    module.exports = CircleProgress
  } else {
    this.CircleProgress = CircleProgress
  }
})($)