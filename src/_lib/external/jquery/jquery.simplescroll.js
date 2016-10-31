/*! jquery.simplescroll
 * 
 * Copyright (c) 2016 @literallylara
 * Under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */

(function(factory)
{
	if(typeof define == "function" && define.amd)
	{
		define(["jquery"],factory);
	}
	else if(typeof module !== "undefined" && module.exports)
	{
		module.exports = factory;
	}
	else
	{
		factory(window.jQuery || window.$);
	}
}(function($)
{
	"use strict";

	$(document.head).append(`
		<style>
			.ss-content {position:relative;width:100%;height:100%;overflow:hidden;z-index:0}
			.ss-track {position:absolute;box-sizing:border-box;background:#333;padding:8px}
			.ss-track-x {height:0;width:100%;left:0;bottom:0}
			.ss-track-y {width:0;height:100%;top:0;right:0}
			.ss-handle {position:absolute;top:0;left:0;width:100%;height:100%;background:#666;cursor:pointer}
			.ss-corner {position:absolute;bottom:0;right:0;padding:8px;background:#666;box-shadow:inset 0 0 0 4px #333;display:none}
			.ss-dual.ss-corner {display:block}
			.ss-dual.ss-track-x {width:calc(100% - 16px)}
			.ss-dual.ss-track-y {height:calc(100% - 16px)}
		</style>
	`)

	function makeScrollbar($el, axis, auto)
	{
		let x = axis == "x" ? 0 : 1

		// elements
		let $tr = $("<div class='ss-track ss-track-" + axis + "'>").appendTo($el)
		let $hd = $("<div class='ss-handle ss-handle-" + axis + "'>").appendTo($tr)
		let $ct = $el.find(".ss-content")
		let $cn = $el.find(".ss-corner")

		// axis specific property names
		let pageAxis     = "page" + ["X","Y"][x]
		let deltaAxis    = "delta" + ["X","Y"][x]
		let offsetEdge   = ["left","top"][x]
		let offsetLength = "offset" + ["Width","Height"][x]
		let scrollEdge   = "scroll" + ["Left","Top"][x]
		let scrollLength = "scroll" + ["Width","Height"][x]
		let length       = ["width","height"][x]
		let outerLength  = ["outerWidth","outerHeight"][x]

		// offsets and lengths
		let ot, oh, sl, ol, lt, lh

		// event states
		let down, focus

		// drag events
		$hd.on("mousedown", dragStart)
		$(document).on("mousemove", drag)
		$(document).on("mouseup", ()=>down=false)

		// focus & scroll events
		$el.on("mouseover", ()=>focus=true)
		$el.on("mouseout", ()=>focus=false)
		document.addEventListener("wheel", drag)
		
		// resize events
		$(window).on("resize", resize)
		$el.on("ss-update", resize)

		// scroll event channel
		$ct.on("scroll", () => $el.trigger("scroll", {
			x: $ct[0].scrollLeft,
			y: $ct[0].scrollTop
		}))

		function dragStart(e)
		{
			e.preventDefault()
			
			ot = $tr.offset()[offsetEdge]
			oh = e[pageAxis] - $hd.offset()[offsetEdge]
		
			down = true
		}

		function drag(e)
		{
			if ((e.type == "mousemove" && !down) || (e.type == "wheel" && !focus)) return
			
			e.preventDefault()

			$ct[0][scrollEdge] = Math.min(Math.max(down
				// scroll by drag
				? (e[pageAxis]-ot-oh)/(lt-lh)*(sl-ol)
				// scroll by wheel
				: $ct[0][scrollEdge]+e[deltaAxis]
			,0),sl-ol)
			
			// translate handle
			$hd.css(offsetEdge, $ct[0][scrollEdge]/(sl-ol)*(lt-lh) + "px")
		}

		function resize()
		{
			ol = $el[0][offsetLength]
			sl = $ct[0][scrollLength]

			// auto hide
			auto && $tr.toggle(sl > ol)

			// corner visible?
			$tr.add($cn).toggleClass("ss-dual", $el.find("> .ss-track:visible").length > 1)

			// adjust length
			$hd.css(length, ol/sl*100 + "%")

			// update lengths
			lt = $tr[outerLength]()
			lh = $hd[outerLength]()

			// correct handle position
			$hd.css(offsetEdge, $ct[0][scrollEdge]/(sl-ol)*(lt-lh) + "px")
			
			// correct scroll position
			$ct[0][scrollEdge] = Math.min(Math.max($hd.position()[["left","top"][x]]/(lt-lh)*(sl-ol),0),sl-ol)
		}
	}

	$.fn.simplescroll = function(opts) { this.each(function()
	{
		let $el = $(this)

		if ($el.find(".ss-content").length)
		{
			$el.trigger("ss-update")
			return
		}

		$el.wrapInner("<div class='ss-content'>")

		let style = getComputedStyle($el[0])

		let o  = style["overflow"]
		let ox = style["overflow-x"]
		let oy = style["overflow-y"]

		let x = ~["auto","scroll"].indexOf(ox) || ~["auto","scroll"].indexOf(o)
		let y = ~["auto","scroll"].indexOf(oy) || ~["auto","scroll"].indexOf(o)

		x && y && $("<div class='ss-corner'>").appendTo($el)

		x && makeScrollbar($el, "x", ox == "auto" || o == "auto")
		y && makeScrollbar($el, "y", oy == "auto" || o == "auto")

		$el.css({ position: "relative", overflow: "hidden" }).trigger("resize").trigger("ss-init")
	})}
}))