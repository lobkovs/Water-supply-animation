var water = {};
$(document).ready(function() {
	var s = Snap('#drawing'),
		s_width = s.node.width.baseVal.value;
		s_height = s.node.height.baseVal.value,
		overlay = $("#overlay_layer").hide();
	water.anim_class = "in-animation";

	/* ***
	*** START - Hide all frames
	*** */
	$(".frames").each(function(index) {
		var this_frame_id = $(this).attr("id"),
			svg_frame = s.select("#"+this_frame_id+"_bg"),
			svg_frame_include = s.select("#"+this_frame_id+"_include");
		svg_frame.attr({
			"transform": "s.1,.1",
		});
		svg_frame_include.attr({
			"opacity": 0
		});
		$(this).hide();
	});
	/* ***
	*** END - Hide all frames
	*** */

	/* ***
	*** START - Rotate and Click event close buttons
	*** */
	$(".close_button").each(function() {
		var closeB = s.select("#"+$(this).attr("id")),
			closeBBox = closeB.getBBox();
		closeB
			.mouseover(function() {
				this.stop().animate({"transform": "r90,"+closeBBox.cx+","+closeBBox.cy}, 600, mina.bounce);
			})
			.mouseout(function() {
				this.stop().animate({"transform": "r0,"+closeBBox.cx+","+closeBBox.cy}, 400, mina.bounce);
			})
			.click(function() {
				/* *** if we have any timeout's, then clear their *** */
				if(water.timeout) {
					water.timeout.forEach(function(item) {
						clearTimeout(item);
					});
				}
				animationFrameStop(this.parent().parent().attr("id"));
				animationMainStart();
			});
	});
	/* ***
	*** END - Rotate close buttons
	*** */
	/* ***
	*** START - House animate
	*** */
	$(".houses").each(function(index) {
		bbox_elem = this.getBBox();
		var id = $(this).attr("id"),
			house = s.select("#"+id),
			text = s.select("#"+id+"_text").attr({"transform":"s0,0", "opacity":0});
		house
			.mouseover(function() {
				house_wrapper = s.select("#"+this.attr("id")+"-wrapper");
				text_house = s.select("#"+this.attr("id")+"_text");
				
				house_wrapper.stop().transform("").animate({'stroke':"#00C0F3", 'opacity': 1, 'stroke-width': 3}, 150);
				text_house.stop().animate({"opacity": 1, "transform":"s1,1"}, 700, mina.bounce);
			})
			.mouseout(function() {
				house_wrapper.stop().animate({'opacity': 0, 'transform': 's1.3,1.3'}, 300);
				text_house.stop().animate({"opacity": 0, "transform":"s0,0"}, 100);
			})
			.click(function() {
				overlay.show();
				water.timeout = [];
				animationFrameStart(this);
				animationMainStop();
				
			});
	});
	/* ***
	*** END - House animate
	*** */

	function animationMainStart() {
		var frameId = "frame_main";
		animationArrowStart();
		animationWavesStart();
		animatePipesStart(frameId);
	}
	function animationMainStop() {
		var frameId = "frame_main";
		animationWavesStop();
		animationArrowStop();
		animatePipesStop(frameId);
		// animationFrameStop(frameId);
	}
	function animationArrowStart() {
		/* ***
		*** START - Arrow water animate
		*** */
		var arrow_matrix = new Snap.Matrix();
		var arrow = s.select("#arrow");
		arrow_matrix.translate("-40", "-26");
		var arrow_matrix_invert = arrow_matrix.invert();
		animate_arrow();
		function animate_arrow() {
			arrow.attr({"opacity": 1});
			arrow.animate(
				{"transform":arrow_matrix, "opacity": 0},
				1000,
				mina.linear,
				function() {
					this.animate(
						{"transform":arrow_matrix_invert},
						800,
						mina.linear,
						function() {
							this.animate(
								{"opacity":1},
								100,
								mina.linear,
								animate_arrow
						)}
					);
				});
		}
		/* ***
		*** END - Arrow animate
		*** */
	}
	function animationArrowStop() {
		var arrow = s.select("#arrow");
		arrow.stop();
	}
	function animationWavesStart() {
		/* ***
		*** START - Waves animate
		*** */
		$(".waves").each(function(index) {
			var wave_id = $(this).attr("id"),
				wave = s.select("#"+wave_id),
				wave_d = wave.attr("d");
			if (!wave.attr("d-orig")) {
				wave.attr({
				"d-orig": wave_d
				});
			}
			var wave_def = s.select("#"+wave_id+"_deform");
			wave_def.attr({"strokeWidth": 0});
			// wave.animate({"d": wave_def.attr("d")}, 600, mina.linear);

			deform_wave_to();
			function deform_wave_to() {
				wave.animate({"d": wave_def.attr("d")}, 600, mina.linear, deform_wave_from);
			};
			function deform_wave_from() {
				wave.animate({"d": wave.attr("d-orig")}, 600, mina.linear, deform_wave_to);
			};
		});
		/* ***
		*** END - Waves animate
		*** */
	}
	function animationWavesStop() {
		$(".waves").each(function(index) {
			var wave_id = $(this).attr("id");
			var wave = s.select("#"+wave_id);
			wave.stop();
		});
	}
	function animatePipesStart(frame) {
		/* ***
		*** START - Pipes animate
		*** */
		$("#" + frame + " .pipes").each(function(index) {
			var pipeid = $(this).attr("id"),
				myPipes = s.select("#"+pipeid),
				myPipes_water = s.select("#"+pipeid+"_water");
			myPipes.attr({
				strokeWidth: 10,
				fill: "none",
			});
			myPipes_water.attr({
				strokeWidth: 6,
				fill: 'none',
				"stroke-dasharray": "30 5",
				"stroke-dashoffset": "10"
			}).animate({"stroke-dashoffset": 100}, -1000, mina.linear);
		});
		/* ***
		*** END - Pipes animate
		*** */
	}
	function animatePipesStop(frameId, color) {
		var color = color || false;
		$("#" + frameId + " .pipes").each(function(index) {
			var pipeid = $(this).attr("id"),
				myPipes = s.select("#"+pipeid),
				myPipes_water = s.select("#"+pipeid+"_water");
			myPipes_water.stop();
			if (color) {
				myPipes_water.attr({
					stroke: myPipes.attr("stroke")
				});
			};
		});
	}
	function animationFrameStart(frameObg) {
		/* ***
		*** START - this function show frame and start animation process
		*** */
		var frame_id = frameObg.attr("id"),
			frame_data = frameObg.attr("data-frame");
			frame_bg = s.select("#"+frame_data+"_bg"),
			frame_include = s.select("#"+frame_data+"_include");
			$("#"+frame_data).show();
		// console.log(frame_data);
		frame_bg.animate({
			"transform":"s1,1",
			"opacity":1
		}, 300, mina.linear, function() {
			frame_include.animate({
				"opacity":1
			}, 100, mina.linear, function() {
				// animatePipesStart(frame_data);

				animFunc = "animation_"+frame_data;
				// console.log(animFunc);
				if (water[animFunc]) {
					water[animFunc](frame_data);
				} else {
					animatePipesStart(frame_data);
				}
			}
			)}
		);
		/* ***
		*** END - this function show frame and start animation process
		*** */
	}
	function animationFrameStop(frameId) {
		var frame_bg = s.select("#"+frameId+"_bg"),
			frame_include = s.select("#"+frameId+"_include");
		animatePipesStop(frameId);
		if (frame_include) {
			frame_include.animate({
				"opacity": 0
			}, 100, mina.linear, function() {
				frame_bg.animate({
					"transform":"s.1,.1",
					"opacity":0
				}, 200, mina.linear, function() {
					$("#"+frameId).hide();
					animFunc = "stop_"+frameId;
					// console.log(animFunc);
					if (water[animFunc]) {
						water[animFunc](frameId);
					}
					overlay.hide();
					// animatePipesStart("frame_main");
					// animationMainStart();
				})
			});
		}
	}
	function animationCurPipe(pipe, color, hex) {
		var color = color || false,
			hex = hex || "#17BFF1",
			pipeid = pipe.attr("id"),
			myPipes = s.select("#"+pipeid),
			myPipes_water = s.select("#"+pipeid+"_water");
		myPipes.attr({
			strokeWidth: 10,
			fill: "none",
		});
		if (color) {
			myPipes_water.attr({
				stroke: hex,
			});
		}
		myPipes_water.attr({
			strokeWidth: 6,
			fill: 'none',
			"stroke-dasharray": "30 5",
			"stroke-dashoffset": "10"
		}).stop().animate({"stroke-dashoffset": 100}, -1000, mina.linear);
	}
	function addCircles(obj, count) {
		if (!water[obj+"_kroshka"]) {
			water[obj+"_kroshka"] = true;
			var wrapObj = s.select("#"+obj),
				wrapObjBBox = wrapObj.getBBox(),
				wrapObjGroup = s.g();

			for (var i = 0; i < count; i++) {
				circ_x = getRandomInt(wrapObjBBox.x+10, wrapObjBBox.x2-10);
				circ_y = getRandomInt(wrapObjBBox.y+37, wrapObjBBox.y2-20);
				circ_r = getRandomInt(1,2);
				circle = s.circle(circ_x,circ_y, circ_r);
				circle.attr({
					"fill":"#17BFF1"
				});
				wrapObjGroup.add(circle);
			};
			wrapObjGroup.attr({
				"class":"hide",
				"style":"display:block;",
				"id":obj+"_kroshka"
			});
			wrapObj.append(wrapObjGroup);
		} else {
			$("#"+obj+"_kroshka").show(400);
		}
	}
	function getRandomInt(min, max) {
	  // return Math.floor(Math.random() * (max - min + 1)) + min;
	  return Math.random() * (max - min + 1) + min;
	}
	water.animation_frame_1 = function(frameObj) {
		/* flag describe animation status */
		water.inAnimation = false;

		water.timeout.push(setTimeout(function() {
			$("#"+frameObj+"_text path").eq(0).show();
			/* *** animation first pipe *** */
			animationCurPipe($("#f1_pipes_1"), true, "#FFFFFF");
			var arrow_1 = s.select("#f1_arrow_1");
			$("#f1_arrow_1").show();
			function line_move() {
				arrow_1.animate({
					"transform": "matrix(1 0 0 1 0 5)"
				}, 400, mina.linear, function() {
					arrow_1.animate({
						"transform": "matrix(1 0 0 1 0 0)"
					}, 400, mina.linear, line_move.bind(null))
				})
			};
			line_move();
			var arrow_2 = s.select("#f1_arrow_2");
			$("#f1_arrow_2").show();
			function line_move_2() {
				arrow_2.animate({
					"transform": "matrix(1 0 0 1 3 6)"
				}, 400, mina.linear, function() {
					arrow_2.animate({
						"transform": "matrix(1 0 0 1 0 0)"
					}, 400, mina.linear, line_move_2.bind(null))
				})
			};
			line_move_2();
			var arrow_3 = s.select("#f1_arrow_3");
			$("#f1_arrow_3").show();
			function line_move_3() {
				arrow_3.animate({
					"transform": "matrix(1 0 0 1 -3 6)"
				}, 400, mina.linear, function() {
					arrow_3.animate({
						"transform": "matrix(1 0 0 1 0 0)"
					}, 400, mina.linear, line_move_3.bind(null))
				})
			};
			line_move_3();
			arrow_1.addClass(water.anim_class);
			arrow_2.addClass(water.anim_class);
			arrow_3.addClass(water.anim_class);
		}, 50));

		water.timeout.push(setTimeout(function() {
			// animationCurPipe($("#"+frameObj+" .pipes:eq(1)"), true);
			animationCurPipe($("#f1_pipes_2"), true);
			$("#"+frameObj+"_text path").eq(0).hide();
			$("#"+frameObj+"_text path").eq(1).show();
		}, 3500));

		water.timeout.push(setTimeout(function() {
			// animationCurPipe($("#"+frameObj+" .pipes:eq(2)"), true);
			animationCurPipe($("#f1_pipes_3"), true);
			// animationCurPipe($("#"+frameObj+" .pipes:eq(3)"), true);
			animationCurPipe($("#f1_pipes_4"), true);
			$("#"+frameObj+"_text path").eq(1).hide();
			$("#"+frameObj+"_text path").eq(2).show();
			cur_text = s.select("#"+$("#"+frameObj+"_text path").eq(2).attr("id")).addClass(frameObj+"-current-show");
			water.inAnimation = true;
		}, 7000));
		$("#"+frameObj+" .rect_info").each(function(index) {
			index = index + 1;
			$(this)
			.hover(function() {
				/* if animation on frame 2 no finish, then not accept handler hover event */
				if(water.inAnimation) {
					$("#"+cur_text.node.id).hide();
					$("#f1_text_desc_"+index).show();
				}
			}, function() {
				/* if animation on frame 2 no finish, then not accept handler hover event */
				if(water.inAnimation) {
					$("#f1_text_desc_"+index).hide();
				}
			});
		});
	}
	water.stop_frame_1 = function(frameObj) {
		$("#"+frameObj+"_text path").each(function() {
			$(this).hide();
		});
		$("#"+frameObj+" ."+water.anim_class).each(function() {
			s.select("#"+$(this).attr("id")).stop();
		});
		$("#"+frameObj+" .hide").each(function() {
			$(this).hide();
		});
		animatePipesStop(frameObj, true);
	}
	water.animation_frame_2 = function(frameObj) {
		/* flag describe animation status */
		water.inAnimation = false;
		$("#"+frameObj+"_text path").eq(0).show();
		/* *** animation first pipe *** */
		animationCurPipe($("#f2_pipes_1"), true);
		/* *** animation propelers and push in timeout array *** */
		water.timeout.push(setTimeout(function() {
			$(".propeler").each(function () {
			var propelers = s.select("#"+$(this).attr("id")),
				propelersBBox = propelers.getBBox();
			function propelers_animation(el, bbox) {
				el.transform("r0,"+bbox.cx+","+bbox.cy);
				el.animate({"transform": "r180,"+bbox.cx+","+bbox.cy}, 600, mina.linear, propelers_animation.bind(null, el, bbox));
			}
			propelers_animation(propelers, propelersBBox);
			propelers.addClass(water.anim_class);
		})}, 1500));
		/* *** animation first arrow and push in timeout array *** */
		water.timeout.push(setTimeout(function() {
			$("#f2_text_1").show();
			var arrow_1 = s.select("#f2_arrow_1");
			$("#f2_arrow_1").show();
			function line_move() {
				arrow_1.animate({
					"transform": "matrix(1 0 0 1 10 0)"
				}, 400, mina.linear, function() {
					arrow_1.animate({
						"transform": "matrix(1 0 0 1 0 0)"
					}, 400, mina.linear, line_move.bind(null))
				})
			};
			line_move();
			arrow_1.addClass(water.anim_class);
		}, 2500));
		/* *** animation second pipe and push in timeout array *** */
		water.timeout.push(setTimeout(function() {
			animationCurPipe($("#f2_pipes_2"), true);
		}, 5000));
		/* *** show second text and hide first text and push in timeout array *** */
		water.timeout.push(setTimeout(function() {
			$("#"+frameObj+"_text path").eq(0).hide();
			$("#"+frameObj+"_text path").eq(1).show();
		}, 5500));
		/* *** show osadok and text  and push in timeout array *** */
		water.timeout.push(setTimeout(function() {
			$("#f2_osadok").show();
			$("#f2_text_5").show();
		}, 5800));
		/* *** show arrow 2 and push in timeout array *** */
		water.timeout.push(setTimeout(function() {
			$("#f2_arrow_2").show();
		}, 6000));
		/* *** animation third pipe and push in timeout array *** */
		water.timeout.push(setTimeout(function() {
			animationCurPipe($("#f2_pipes_3"), true);
		}, 9000));
		/* *** show third text and hide second text *** */
		water.timeout.push(setTimeout(function() {
			$("#"+frameObj+"_text path").eq(1).hide();
			$("#"+frameObj+"_text path").eq(2).show();
		}, 9500));
		/* *** animation fourth pipe and push in timeout array *** */
		water.timeout.push(setTimeout(function() {
			animationCurPipe($("#f2_pipes_4"), true);
			var arrow_3 = s.select("#f2_arrow_3");
			$("#f2_arrow_3").show();
			function line_move(el) {
				el.animate({
					"transform": "matrix(1 0 0 1 0 12)"
				}, 400, mina.linear, function() {
					el.animate({
						"transform": "matrix(1 0 0 1 0 0)"
					}, 400, mina.linear, line_move.bind(null, el))
				})
			};
			line_move(arrow_3);
			arrow_3.addClass(water.anim_class);
		}, 12500));
		water.timeout.push(setTimeout(function() {
			$("#"+frameObj+"_text path").eq(2).hide();
			$("#"+frameObj+"_text path").eq(3).show();
		}, 12000));
		water.timeout.push(setTimeout(function() {
			animationCurPipe($("#f2_pipes_5"), true);
		}, 15000));
		water.timeout.push(setTimeout(function() {
			$("#"+frameObj+"_text path").eq(3).hide();
			$("#"+frameObj+"_text path").eq(4).show();
			cur_text = s.select("#"+$("#"+frameObj+"_text path").eq(4).attr("id")).addClass(frameObj+"-current-show");
			water.inAnimation = true;
		}, 15500));
		$("#"+frameObj+" .rect_info").each(function(index) {
			index = index + 1;
			$(this)
			.hover(function() {
				/* if animation on frame 2 no finish, then not accept handler hover event */
				if(water.inAnimation) {
					$("#"+cur_text.node.id).hide();
					$("#f2_text_desc_"+index).show();
				}
			}, function() {
				/* if animation on frame 2 no finish, then not accept handler hover event */
				if(water.inAnimation) {
					$("#f2_text_desc_"+index).hide();
				}
			});
		});
	}
	water.stop_frame_2 = function(frameObj) {
		$("#"+frameObj+"_text path").each(function() {
			$(this).hide();
		});
		$("#"+frameObj+" ."+water.anim_class).each(function() {
			s.select("#"+$(this).attr("id")).stop();
		});
		$("#"+frameObj+" .hide").each(function() {
			$(this).hide();
		});
		animatePipesStop(frameObj, true);
	}
	// water.animation_frame_3 = function(frameId) {
	// 	animatePipesStart(frameId);
	// }
	// water.animation_frame_4_5 = function(frameId) {
	// 	animatePipesStart(frameId);
	// }
	// water.animation_frame_6 = function(frameId) {
	// 	animatePipesStart(frameId);
	// }
	water.animation_frame_7 = function(frameObj) {
		var frameTime = 0;
		/* flag describe animation status */
		water.inAnimation = false;
		$("#"+frameObj+"_text path").eq(0).show();
		/* *** animation first pipe *** */
		animationCurPipe($("#f7_pipe_1"), true);

		water.timeout.push(setTimeout(function() {
			$("#"+frameObj+"_text path").eq(0).hide();
			$("#"+frameObj+"_text path").eq(1).show();
			animationCurPipe($("#f7_pipe_2"), true);
		}, frameTime+=3000));

		water.timeout.push(setTimeout(function() {
			$("#"+frameObj+"_text path").eq(1).hide();
			$("#"+frameObj+"_text path").eq(2).show();
			animationCurPipe($("#f7_pipe_3"), true);
		}, frameTime+=5000));

		water.timeout.push(setTimeout(function() {
			$("#"+frameObj+"_text path").eq(2).hide();
			$("#"+frameObj+"_text path").eq(3).show();
			$("#"+frameObj+" #f7_arrow_1").show();
			$("#"+frameObj+" #f7_arrow_2").show();
			$("#"+frameObj+" #f7_text_3_1").show();
			$("#"+frameObj+" #f7_truck_1").show();
		}, frameTime+=5000));

		water.timeout.push(setTimeout(function() {
			$("#"+frameObj+"_text path").eq(3).hide();
			$("#"+frameObj+"_text path").eq(4).show();
			animationCurPipe($("#f7_pipe_4"), true);
		}, frameTime+=5000));

		water.timeout.push(setTimeout(function() {
			$("#"+frameObj+" #f7_first_otstoinik_1_content").show();
		}, frameTime+=300));

		water.timeout.push(setTimeout(function() {
			$("#"+frameObj+"_text path").eq(4).hide();
			$("#"+frameObj+"_text path").eq(5).show();
			$("#"+frameObj+" #f7_arrow_3").show();
			$("#"+frameObj+" #f7_obrabotka_osadka").show();
			$("#"+frameObj+" #f7_arrow_3_1").show();
			var f7_arrow_3_1 = s.select("#"+frameObj+" #f7_arrow_3_1");
			var f7_arrow_3_2 = s.select("#"+frameObj+" #f7_arrow_3_2");
			function f7_line_move(el) {
				el.animate({
					"transform": "matrix(1 0 0 1 3 0)"
				}, 400, mina.linear, function() {
					el.animate({
						"transform": "matrix(1 0 0 1 -3 0)"
					}, 400, mina.linear, f7_line_move.bind(null, el))
				});
				el.addClass(water.anim_class);
			};
			f7_line_move(f7_arrow_3_1);
			f7_line_move(f7_arrow_3_2);
			$("#"+frameObj+" #f7_truck_2").show();
			$("#"+frameObj+" #f7_arrow_3_2").show();
			$("#"+frameObj+" #f7_ilovie_ploshadki").show();
			addCircles("f7_ilovie_ploshadki", 100);
			animationCurPipe($("#f7_pipe_5"), true);
		}, frameTime+=5000));

		water.timeout.push(setTimeout(function() {
			$("#"+frameObj+"_text path").eq(5).hide();
			$("#"+frameObj+"_text path").eq(6).show();
		}, frameTime+=5000));

		water.timeout.push(setTimeout(function() {
			addCircles("f7_aerotenki", 150);
		}, frameTime+=300));

		water.timeout.push(setTimeout(function() {
			$("#"+frameObj+" #f7_first_otstoinik_2_content").show();
			$("#"+frameObj+" #f7_text_6").show();
			$("#"+frameObj+" #f7_arrow_4").show();
			$("#"+frameObj+" #f7_arrow_5").show();
			animationCurPipe($("#f7_pipe_6"), true);
		}, frameTime+=5000));

		water.timeout.push(setTimeout(function() {
			animationCurPipe($("#f7_pipe_7"), true);
			animationCurPipe($("#f7_pipe_8"), true);
			$("#"+frameObj+"_text path").eq(6).hide();
			$("#"+frameObj+"_text path").eq(7).show();
			cur_text = s.select("#"+$("#"+frameObj+"_text path").eq(7).attr("id")).addClass(frameObj+"-current-show");
			water.inAnimation = true;
		}, frameTime+=5000));
		$("#"+frameObj+" .rect_info").each(function(index) {
			index = index + 1;
			$(this)
			.hover(function() {
				/* if animation on frame 7 no finish, then not accept handler hover event */
				if(water.inAnimation) {
					$("#"+cur_text.node.id).hide();
					$("#f7_text_desc_"+index).show();
				}
			}, function() {
				/* if animation on frame 7 no finish, then not accept handler hover event */
				if(water.inAnimation) {
					$("#f7_text_desc_"+index).hide();
				}
			});
		});
	}
	water.stop_frame_7 = function(frameObj) {
		$("#"+frameObj+"_text path").each(function() {
			$(this).hide();
		});
		$("#"+frameObj+" ."+water.anim_class).each(function() {
			s.select("#"+$(this).attr("id")).stop();
		});
		$("#"+frameObj+" .hide").each(function() {
			$(this).hide();
		});
		animatePipesStop(frameObj, true);
	}
	animationMainStart();

	// console.log(window);
});