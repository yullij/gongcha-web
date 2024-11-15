var positions		= [];
var markerList		= [];
var	selectedMarker  = null;
var map;

FormCheck = {

	Check: function(form){
		var frm = $("#"+form);
		var ret = true;

		$.each(frm[0].elements, function(i, element){
			if(element.getAttribute("required")!=null || element.getAttribute("req")!=null){
				switch(element.type){
					case "checkbox":
					case "radio":
						if(!FormCheck.SelectCheck(form, element)){
							ret = false;
							return false;
						}
						break;
					default:
						if(!FormCheck.TextCheck(form, element)){
							ret = false;
							return false;
						}
				}
			}

			if (element.getAttribute("option")!=null && element.value.length>0){
				if(!FormCheck.PatternCheck(form, element)){
					ret = false;
					return false;
				}
			}

			if(element.getAttribute("minlength")!=null || element.getAttribute("maxlength")!=null){
				if(!FormCheck.LengthCheck(form, element)){
					ret = false;
					return false;
				}
			}

		});
		return ret;
	},

	SelectCheck: function(form, element){
		var frm = $("#"+form);
		var ret = false;
		var $fieldname = frm.find(element.tagName+"[name="+element.getAttribute("name")+"]");

		for(var i=0; i<$fieldname.length; i++) if($fieldname.is(':checked')) ret = true;

		if (!ret){
			alert("["+frm.find("label[for="+element.getAttribute("id")+"]:eq(0)").text()+"] 항목을 선택해주세요.");
			return false;
		}
		return true;
	},

	TextCheck: function(form, element){
		var frm = $("#"+form);
		var $fieldid = $("#"+element.getAttribute("id"));
		var msg = (frm.find("label[for="+element.getAttribute("id")+"]:eq(0)").text())? frm.find("label[for="+element.getAttribute("id")+"]:eq(0)").text(): $fieldid.attr("title");

		if(!$fieldid.val()) {
			console.log(element.getAttribute("id"));
			alert("["+msg+"] 항목을 입력해 주세요.");
			$fieldid.focus();
			return false;
		}
		return true;
	},

	LengthCheck: function(form, element){
		var frm = $("#"+form);
		var $fieldid = $("#"+element.getAttribute("id"));
		var minlen = parseInt($fieldid.attr("minlength"), 10);
		var maxlen = parseInt($fieldid.attr("maxlength"), 10);
		var text = parseInt($.trim($fieldid.val().length), 10);

		if(minlen) {
			if (text<minlen){
				alert("해당 항목은 "+minlen+"자 이상 입력해주세요.");
				$fieldid.focus();
				return false;
			}
		}
		if(maxlen) {
			if (text>maxlen){
				alert("해당 항목은 "+maxlen+"자 이하로 입력해주세요.");
				$fieldid.focus();
				return false;
			}
		}
		return true;
	},

	PatternCheck: function(form, element){
		var frm = $("#"+form);
		var pattern, msg;
		var option = element.getAttribute("option");
		var sval = element.value;
		var $fieldid = $("#"+element.getAttribute("id"));

		switch(option){
			case "regNum": pattern = /^[0-9]+$/; msg="숫자"; break;
			case "regEmail": pattern = /^[^"'@]+@[._a-zA-Z0-9-]+\.[a-zA-Z]+$/; msg="이메일형식"; break;
			case "regUrl": pattern = /^(http\:\/\/)*[.a-zA-Z0-9-]+\.[a-zA-Z]+$/; msg="URL"; break;
			case "regAlpha": pattern = /^[a-zA-Z]+$/; msg="영문"; break;
			case "regHangul": pattern = /[가-힣]/; msg="한글"; break;
			case "regHangulEng": pattern = /[가-힣a-zA-Z]/; msg="한글/영문포함"; break;
			case "regHangulOnly": pattern = /^[가-힣]*$/; msg="한글만"; break;
			case "regId": pattern = /^[a-zA-Z0-9]{1}[^"']{3,9}$/; msg="영문/숫자"; break;
			case "regPass": pattern = /^[0-9a-zA-Z]{6,10}$/; msg="영문/숫자"; break;
		}

		pattern = eval(pattern);

		if(!pattern.test(sval)){
			alert("["+frm.find("label[for="+element.getAttribute("id")+"]:eq(0)").text()+"] 항목의 입력형식을 확인해주세요. ["+ msg +"]");
			$fieldid.val('').focus();
			return false;
		}
		return true;
	}
}

Product = {
	Init : function(){
		$(".pro_list_wrap a").click(function(){
			Product.View($(this));
		});
	},

	View : function($obj){
		var no = $obj.attr("n");

		if(no){
			$(".pro_info_wrap").remove();

			try {
				$.ajax({
					url: "productView.php?no=" + no,
					type: "POST",
					timeout: 10000,
					dataType: "html",
					success: function(html){
						$obj.parent().parent().parent().after(html);
						setTimeout(function(){
							$(".pro_info_wrap").addClass("open")
							$('#productView').focus();
						}, 100);

					},
					error: function(xhr){
						alert('['+xhr.status+'] 서버전송오류가 발생했습니다.');
					}
				});
			} catch(e){
				alert(e.description);
			}
		}
	},

	ViewClose : function(){
		$(".pro_info_wrap").removeClass("open")
		setTimeout(function(){$(".pro_info_wrap").remove();}, 300);
	}
}


Store = {

	Init : function(){
		$('#store_list').mCustomScrollbar();

		$("#etc9").change(function(){
			$("#sido").val("");
			$("#etc10").val("");
			$("#subject").val("");

			if($("#etc9").val()!="")
				$("#sido").val($("#etc9 option:selected").text());

			Store.GetGugun($(this).val());
			Store.LoadData();
		});

		$("#etc10").change(function(){
			$("#subject").val("");
			Store.LoadData();
		});

		$("#frmSearch").submit(function(){
			Store.LoadData();
			return false;
		});

		Store.LoadData();
	},

	GetGugun : function(v){

		try {
			$.ajax({
				url: "/common/address.php?sido=" + encodeURIComponent(v),
				type: "GET",
				timeout: 10000,
				dataType: "html",
				success: function(html){
					$("#etc10").html(html);
				},
				error: function(xhr){
					alert('['+xhr.status+'] 서버전송오류가 발생했습니다.');
				}
			});
		} catch(e){
			alert(e.description);
		}
	},

	LoadData : function(){
		try {
			$.ajax({
				url: "/brand/store/store.php?m=l",
				type: "POST",
				data: $("#frmSearch").serialize(),
				timeout: 10000,
				dataType: "html",
				success: function(html){

					if($.trim(html)!=""){
						$(".store_null").css("display", "none");

						$("#store_list ul").empty();
						$("#store_list ul").append(html);
						$('#store_list').mCustomScrollbar();

						$("#store_list ul li:eq(0)").addClass("on");

						$("#store_list ul li a").unbind("click").bind("click", function(){
							$("#store_list ul li").removeClass("on");
							$(this).parent().addClass("on");
							MapData.SelectStore($(this).parent().index());
						});

						MapData.MapLoad();
					}
					else{
						$("#store_list ul").empty();
						$(".store_null").css("display", "block");
					}
				},
				error: function(xhr){
					alert('['+xhr.status+'] 서버전송오류가 발생했습니다.');
				}
			});
		} catch(e){
			alert(e.description);
		}
	},

	ViewStore : function(n){
		Newriver.Util.AjaxPopup('open', "/brand/store/view.php?m=v&no=" + n);
	}
}

MapData = {

	MapLoad : function(){

		if(jQuery.browser.msie){
			if(jQuery.browser.version < 10){
			var val = $("#subject").val().replace("매장명 또는 주소를 입력하세요.", "");
					  $("#subject").val(val);
			}
		}

		try {
			$.ajax({
				url: "/brand/store/store.php?m=map",
				type: "POST",
				data: $("#frmSearch").serialize(),
				timeout: 10000,
				dataType: "JSON",
				success: function(data){

					if(data){
						positions = [];
						markerList = [];
						var container	= document.getElementById('store_map');

						for(var i=0; i < data.length;i++){
							var store = data[i];
							var pos = {latlng: new daum.maps.LatLng(store["etc2"], store["etc3"]), content_no : store["content_no"]};

							positions.push(pos);
						}

						var mapOption	= {center: positions[0].latlng, level: 4};
						map			= new daum.maps.Map(container, mapOption);
						map.addOverlayMapTypeId(daum.maps.MapTypeId.TERRAIN);

						for (var i = 0; i < positions.length; i ++) {
							var content_no = positions[i].content_no;
							MapData.Maker(map, positions[i].latlng, content_no, i);
						}
					}
				},
				error: function(xhr){
					alert('['+xhr.status+'] 서버전송오류가 발생했습니다.');
				}
			});
		} catch(e){
			alert(e.description);
		}
	},

	Maker : function(map, position, content_no, i){

		var markerOnImage  = MapData.CreateMarkerImage("on");
		var markerOffImage = MapData.CreateMarkerImage("off");

		var markerImage = (i == 0) ? markerOnImage : markerOffImage;
		var marker = new daum.maps.Marker({
			map		: map,
			position: position,
			image	: markerImage
		});


		if(i == 0) selectedMarker = marker;

		markerList.push(marker);

		daum.maps.event.addListener(marker, 'click', function() {

			$('.store_info_layer').remove();

			try {
				$.ajax({
					url: "/brand/store/view.php?m=s&no="+content_no,
					type: "GET",
					timeout: 10000,
					dataType: "html",
					success: function(html){
						var $html = $(html);
						var yAnchor = 1.43;

						var data1 = $html.find("tr[name='open_01']").length;
						var data2 = $html.find("tr[name='open_02']").length;

						if(data1 || data2) {
							if(data1 && data2) yAnchor = 1.32;
							else {
								if(data1) yAnchor = 1.38;
								if(data2) yAnchor = 1.32;
							}
						}

						map.panTo(position);
						var customOverlay = new daum.maps.CustomOverlay({
							map: map,
							position: position,
							content: html,
							yAnchor: yAnchor
						});
					},
					error: function(xhr){
						alert('['+xhr.status+'] 서버전송오류가 발생했습니다.');
					}
				});
			} catch(e){
				alert(e.description);
			}

			if (!selectedMarker || selectedMarker !== marker) {
				selectedMarker.setImage(markerOffImage);
				marker.setImage(markerOnImage);
			}

			selectedMarker = marker;
		});
	},

	SelectStore : function(i){
		map.panTo(positions[i].latlng);
		$('.store_info_layer').remove();

		try {
			$.ajax({
				url: "/brand/store/view.php?m=s&no="+positions[i].content_no,
				type: "GET",
				timeout: 10000,
				dataType: "html",
				success: function(html){
					var $html = $(html);
					var yAnchor = 1.43;

					var data1 = $html.find("tr[name='open_01']").length;
					var data2 = $html.find("tr[name='open_02']").length;

					if(data1 || data2) {
						if(data1 && data2) yAnchor = 1.32;
						else {
							if(data1) yAnchor = 1.38;
							if(data2) yAnchor = 1.32;
						}
					}

					var markerOnImage  = MapData.CreateMarkerImage("on");
					var markerOffImage = MapData.CreateMarkerImage("off");

					var customOverlay = new daum.maps.CustomOverlay({
						map: map,
						position: positions[i].latlng,
						content: html,
						yAnchor: yAnchor
					});

					if (!selectedMarker || selectedMarker !== markerList[i]) {
						selectedMarker.setImage(markerOffImage);
						markerList[i].setImage(markerOnImage);
					}

					selectedMarker = markerList[i];
				},
				error: function(xhr){
					alert('['+xhr.status+'] 서버전송오류가 발생했습니다.');
				}
			});
		} catch(e){
			alert(e.description);
		}
	},

	CreateMarkerImage : function(m){
		var imageSrc	= (m == 'on') ? 'http://www.gong-cha.co.kr/view/gongcha/images/common/ico_map_store.png' : 'http://www.gong-cha.co.kr/view/gongcha/images/common/ico_map_store_off.png';
		var imageSize	= new daum.maps.Size(40, 58);
		var imageOption = {offset: new daum.maps.Point(12, 46)};
		var markerImage  = new daum.maps.MarkerImage(imageSrc, imageSize, imageOption);

		return markerImage;
	}
}

Customer = {
	Init : function(){
		var detach1 = $("#etc81").find("option").detach();
		var detach2 = $("#etc91").find("option").detach();

		$("#etc1").change(function(){
			var cate1 = $(this).val();
			$("#etc81").append(detach1);

			if(!cate1 || cate1 == "01") {
				$("#etc81, #etc91").val('');
				$("#cate2, #cate3").hide();
				return;
			}

			$("#etc81").find("option").each(function(){
				if($(this).val() && cate1 != $(this).val().substring(0, 2)) $(this).remove();
			});

			$("#etc81").val('');
			$("#catetxt2").text('선택');
			$("#cate2").show();
			$("#etc91").val('');
			$("#cate3").hide();
		});

		$("#etc81").change(function(){
			var cate2 = $(this).val();
			$("#etc91").append(detach2);

			if(!cate2 || cate2 == "0301" || cate2 == "0302" || cate2 == "0304") {
				$("#etc91").val('');
				$("#cate3").hide();
				return;
			}

			$("#etc91").find("option").each(function(){
				if($(this).val() && cate2 != $(this).val().substring(0, 4)) $(this).remove();
			});

			$("#etc91").val('');
			$("#catetxt3").text('선택');
			$("#cate3").show();
		});

		$("#email3").change(function(){
			if($(this).val() == "direct"){
				$("#email2").css("display", "block");
				$("#email2").val("");
			}
			else{
				$("#email2").css("display", "none");
				$("#email2").val($(this).val());
			}
		});

		$("#frmWrite").submit(function(){
			if(!FormCheck.Check("frmWrite")) return false;

			if(!$("#etc1").val()){
				alert("1차 구분을 선택해주세요.");
				$("#etc1").focus();
				return false;
			} else {
				if($("#etc1").val() != "01") {
					if(!$("#etc81").val()){
						alert("2차 구분을 선택해주세요.");
						$("#etc81").focus();
						return false;
					} else {
						if($("#etc81").val() != "0301" && $("#etc81").val() != "0302" && $("#etc81").val() != "0304") {
							if(!$("#etc91").val()){
								alert("3차 구분을 선택해주세요.");
								$("#etc91").focus();
								return false;
							}
						}
					}
				}
			}

			if(!$("#sms_yn1").prop("checked") && !$("#sms_yn2").prop("checked")){
				alert("답변여부를 선택해주세요.");
				return false;
			}

			if($("#sms_yn1").prop("checked")){
				if(!$("#etc7").val()){
					alert("답변방법을 선택해주세요.");
					$("#etc7").focus();
					return false;
				}
			}

			if(!$("#agree1_y").prop("checked")){
				alert("개인정보 수집 약관에 동의해 주세요.");
				return false;
			}

			if(!$("#agree2_y").prop("checked")){
				alert("개인정보 제 3자 제공에 동의해 주세요.");
				return false;
			}

			var email = $("#email1").val() + "@" + $("#email2").val();
			if(!Customer.EmailCheck(email)){
				alert("형식에 맞지 않는 이메일주소 입니다.");
				$("#email1").focus();
				return false;
			}

			$("#etc2").val(email);

			var phone = $("#phone1").val() + "-" + $("#phone2").val() + "-" + $("#phone3").val();
			$("#etc4").val(phone);

			if(confirm("작성하신 내용을 저장하시겠습니까?")) return true;
			else return false;
		});
	},

	EmailCheck : function(email) {
		var regex=/([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
		return (email != '' && email != 'undefined' && regex.test(email));
	},


	StoreSearch : function(){

		try {
			$.ajax({
				url: "/brand/store/store.php?m=popup",
				type: "POST",
				data: $("#frmSearch").serialize(),
				timeout: 10000,
				dataType: "html",
				success: function(html){

					if($.trim(html)!=""){
						$("#storeList_no_data").css("display", "none");
						$("#storeList > tbody").empty();
						$("#storeList > tbody").append(html);
						$("#storeList").css("display", "table");
					}
					else{
						$("#storeList > tbody").empty();
						$("#storeList").css("display", "none");
						$("#storeList_no_data p").html("검색 결과가 없습니다.");
						$("#storeList_no_data").css("display", "block");
					}
				},
				error: function(xhr){
					alert('['+xhr.status+'] 서버전송오류가 발생했습니다.');
				}
			});
		} catch(e){
			alert(e.description);
		}
	},

	ReplyCheck : function(){
		if($("#sms_yn1").is(":checked")) $("#sms_type").show();
		else {
			$("#etc7").val('').siblings(".selected").text('선택');
			$("#sms_type").hide();
		}
	}
}

App = {
	Init : function(){

		$("#email3").change(function(){
			if($(this).val() == "direct"){
				$("#email2").css("display", "block");
				$("#email2").val("");
			}
			else{
				$("#email2").css("display", "none");
				$("#email2").val($(this).val());
			}
		});

		$("#frmWrite").submit(function(){
			if(!FormCheck.Check("frmWrite")) return false;

			if(!$("#agree1_y").prop("checked")){
				alert("개인정보 수집 약관에 동의해 주세요.");
				return false;
			}

			var email = $("#email1").val() + "@" + $("#email2").val();

			if(!Customer.EmailCheck(email)){
				alert("형식에 맞지 않는 이메일주소 입니다.");
				$("#email1").focus();
				return false;
			}

			$("#etc2").val(email);

			var phone = $("#phone1").val() + "-" + $("#phone2").val() + "-" + $("#phone3").val();
			$("#etc3").val(phone);

			if(confirm("작성하신 내용을 저장하시겠습니까?")) return true;
			else return false;
		});
	}
}

Main = {
	SearchStore : function(){

		if(!$("#storeName").val()){
			alert("매장명을 입력해 주세요.");
			$("#storeName").focus();
			return;
		}

		location.href = "/brand/store/search.php?store=" + encodeURIComponent($("#storeName").val());
	}
}

Contact = {
	Init : function(){

		$("#email3").change(function(){
			if($(this).val() == "direct"){
				$("#email2").css("display", "block");
				$("#email2").val("");
			}
			else{
				$("#email2").css("display", "none");
				$("#email2").val($(this).val());
			}
		});

		$("#frmWrite").submit(function(){
			if(!FormCheck.Check("frmWrite")) return false;

			/*if(!$("#agree1_y").prop("checked")){
				alert("개인정보 수집 약관에 동의해 주세요.");
				return false;
			}*/

			var email = $("#email1").val() + "@" + $("#email2").val();
			if(!Customer.EmailCheck(email)){
				alert("형식에 맞지 않는 이메일주소 입니다.");
				$("#email1").focus();
				return false;
			}

			$("#etc2").val(email);

			//var phone = $("#phone1").val() + "-" + $("#phone2").val() + "-" + $("#phone3").val();
			//$("#etc4").val(phone);
			$("#etc4").val('');

			if($("#svalchk").val()!='Y'){
				alert("자동등록 방지 코드를 올바르게 입력해주세요.");
				$("#code").focus();
				return false;
			}

			if(confirm("작성하신 내용을 저장하시겠습니까?")) return true;
			else return false;
		});
	}
}



Application = {
	Init : function(){
		$("#sido2").change(function(){
			$("#etc11").val($("#sido2 option:selected").text());
			$("#etc12").val("");
			Application.GetGugun($(this).val());
		});

		$("#sido").change(function(){
			$("#etc9").val($("#sido option:selected").text());
			$("#etc10").val("");
			Store.GetGugun($(this).val());
		});

		$("#frmWrite").submit(function(){
			if(!FormCheck.Check("frmWrite")) return false;

			if(!$("#agree1_y").prop("checked")){
				alert("개인정보 수집 약관에 동의해 주세요.");
				return false;
			}

			var phone = $("#phone1").val() + "-" + $("#phone2").val() + "-" + $("#phone3").val();
			$("#etc4").val(phone);

			if(confirm("작성하신 내용을 저장하시겠습니까?")) return true;
			else return false;
		});
	},

	GetGugun : function(v){

		try {
			$.ajax({
				url: "/common/address.php?sido=" + encodeURIComponent(v),
				type: "GET",
				timeout: 10000,
				dataType: "html",
				success: function(html){
					$("#etc12").html(html);
				},
				error: function(xhr){
					alert('['+xhr.status+'] 서버전송오류가 발생했습니다.');
				}
			});
		} catch(e){
			alert(e.description);
		}
	},

	Check : function(sval){
		switch(sval){
			case "1":
				if(!$("#etc8_5").is(":checked")){
					$("#etctxt1").val('').attr("readonly", "true");
					//$("#etctxt1wrap").hide();
				} else {
					//$("#etctxt1wrap").css("display", "inline-block");
					$("#etctxt1").removeAttr("readonly").focus();
				}
				break;
			case "2":
				if($("#etc13_1").is(":checked") || $("#etc13_2").is(":checked") || $("#etc13_3").is(":checked")){
					$("#etctxt2").val('').attr("readonly", "true");
					//$("#etctxt2wrap").hide();
				} else {
					//$("#etctxt2wrap").css("display", "inline-block");
					$("#etctxt2").removeAttr("readonly").focus();
				}
				break;
			case "3":
				if(!$("#etc14_6").is(":checked")){
					$("#etctxt3").val('').attr("readonly", "true");
					//$("#etctxt3wrap").hide();
				} else {
					//$("#etctxt3wrap").css("display", "inline-block");
					$("#etctxt3").removeAttr("readonly").focus();
				}
				break;
		}
	}
}


Meeting = {

	Init : function(){

		$("#sido").change(function(){
			$("#etc9").val($("#sido option:selected").text());
			$("#etc10").val("");
			Store.GetGugun($(this).val());
		});

		$("#email3").change(function(){
			if($(this).val() == "direct"){
				$("#email2").css("display", "block");
				$("#email2").val("");
			}
			else{
				$("#email2").css("display", "none");
				$("#email2").val($(this).val());
			}
		});

		$("#frmWrite").submit(function(){
			if(!FormCheck.Check("frmWrite")) return false;

			if(!$("#agree1_y").prop("checked")){
				alert("개인정보 수집 약관에 동의해 주세요.");
				return false;
			}

			var email = $("#email1").val() + "@" + $("#email2").val();
			if(!Customer.EmailCheck(email)){
				alert("형식에 맞지 않는 이메일주소 입니다.");
				$("#email1").focus();
				return false;
			}
			$("#etc2").val(email);

			var phone = $("#phone1").val() + "-" + $("#phone2").val() + "-" + $("#phone3").val();
			$("#etc4").val(phone);

			if(confirm("작성하신 내용을 저장하시겠습니까?")) return true;
			else return false;
		});
	}
}



Story = {

	Init : function(){
		$(".more").click(function(){
			$("#page").val($("#page").val() + 1);
		});

		Story.LoadData();
	},

	LoadData : function(){
		try {
			$.ajax({
				url: "/franchise/story/story.ajax.php",
				type: "POST",
				data: $("#frmSearch").serialize(),
				timeout: 10000,
				dataType: "html",
				success: function(html){
					$(".story_list").append(html);
				},
				error: function(xhr){
					alert('['+xhr.status+'] 서버전송오류가 발생했습니다.');
				}
			});
		} catch(e){
			alert(e.description);
		}
	}
}

Instagram = {
	//라이브
	//NextURL : "https://api.instagram.com/v1/users/self/media/recent/?access_token=1983726793.61fa49c.2c2fd2d2cca74087a5c0b2754bf20f2a&count=",
	//NextURL : "https://api.instagram.com/v1/users/self/media/recent/?access_token=1983726793.61fa49c.cb37969fef5849e8b994fdd597851ce2&count=",
	//NextURL : "https://api.instagram.com/v1/users/self/media/recent/?access_token=1983726793.61fa49c.ff0f3d7216d24bfba761c89b58795ade&count=",
	//NextURL : "https://api.instagram.com/v1/users/self/media/recent/?access_token=1983726793.61fa49c.49bb965072aa43af84234cb11e513163&count=",
		NextURL : "https://api.instagram.com/v1/users/self/media/recent/?access_token=1983726793.61fa49c.db934279d12f4bf2bce9e5086b1e8a45&count=",

	MainLoad: function(){
		var url = this.NextURL + "4"

		$.ajax({
			type: "GET",
			dataType: "jsonp",
			cache: false,
			url: url,
			success: function(response){

				var html = "";

				if (response.meta.code == "200") {
					if(response.data.length > 0){

						for(var i=0; i<response.data.length; i++){

							html += '<li class="prevBox">';
							html += '<a href="'+response.data[i].link+'" target="_blank">';
							html += '<img src="'+response.data[i].images.standard_resolution.url+'" alt=""  style="width:300px"/>';
							html += '<img src="/view/gongcha/images/brandmain/main_sns_instagram.png" alt="instagram" class="ico" /></a>';
							html += '</li>';
						}
					}

					Instagram.NextURL = response.pagination.next_url;

					var $moreItem = $(html);
					$(".main_instagram > ul").append($moreItem);
					$(".prevBox").css("display", "none");

					$(".prevBox").css("display", "block");
					$(".prevBox").removeClass("prevBox");
				}
			}
		});
	}
}

Event = {
	DataLoad : function(){
		$("#totalPage").remove();
		var page = Number($("#page").val()) + 1;
		$("#page").val(page);
		try {
			$.ajax({
				url: "/brand/board/event.ajax.php",
				type: "POST",
				data: $("#frmSearch").serialize(),
				timeout: 10000,
				dataType: "html",
				success: function(html){
					$(".gallery_list").append(html);

					var tpage = $("#totalPage").val();
					if(tpage < Number(page) + 1){
						$("#moreBtn").css("display", "none");
					}
				},
				error: function(xhr){
					alert('['+xhr.status+'] 서버전송오류가 발생했습니다.');
				}
			});
		} catch(e){
			alert(e.description);
		}
	}
}

Prize = {
	DataLoad : function(){
		$("#totalPage").remove();
		var page = Number($("#page").val()) + 1;
		$("#page").val(page);
		try {
			$.ajax({
				url: "/brand/board/prize.ajax.php",
				type: "POST",
				data: $("#frmSearch").serialize(),
				timeout: 10000,
				dataType: "html",
				success: function(html){
					$(".gallery_list").append(html);

					var tpage = $("#totalPage").val();
					if(tpage <= Number(page) + 1){
						$("#moreBtn").css("display", "none");
					}
				},
				error: function(xhr){
					alert('['+xhr.status+'] 서버전송오류가 발생했습니다.');
				}
			});
		} catch(e){
			alert(e.description);
		}
	}
}

Member = {

	ViewConfirm : function(no){

		if(!$("#agree1_y").prop("checked") && !$("#agree1_n").prop("checked")){
			alert("동의여부를 선택해 주세요.");
			return;
		}

		var agree_yn = $("#agree1_y").prop("checked") ? "Y" : "N";
		try {
			$.ajax({
				url: "/franchise/store/proc.view.php",
				type: "POST",
				data: {no : no, agreeYN : agree_yn},
				timeout: 10000,
				dataType: "html",
				success: function(data){

					if(data == "0000"){
						if($("#mode").val() == "reg")
							alert("해당 공지사항을 확인하셨습니다.");
						else
							alert("해당 공지사항을 수정하셨습니다.");

						location.reload();
					}
					else{
						location.href = "login.php";
					}
				},
				error: function(xhr){
					alert('['+xhr.status+'] 서버전송오류가 발생했습니다.');
				}
			});
		} catch(e){
			alert(e.description);
		}

	},

	MemberPassword : function(){
		if(!$("#pwd1").val()){
			alert("기존 비밀번호를 입력해 주세요.");
			$("#pwd1").focus();
			return;
		}

		var reg_pwd = /^.*(?=.{10,14})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;
		if(!reg_pwd.test($("#pwd2").val())){
			alert("비빌번호는 영어와 숫자 조합해서 10 ~ 14자로 입력해 주세요.");
			$("#pwd2").focus();
			return;
		}

		if(!$("#pwd2").val()){
			alert("새 비밀번호를 입력해 주세요.");
			$("#pwd2").focus();
			return;
		}

		if(!$("#pwd3").val()){
			alert("비밀번호 확인을 입력해 주세요.");
			$("#pwd3").focus();
			return;
		}

		if($("#pwd2").val() != $("#pwd3").val()){
			alert("새 비밀번호와 비밀번호 확인이 불일치 합니다.");
			$("#pwd3").focus();
			return;
		}

		if(confirm("비밀번호를 변경하시겠습니까?")){
			try {
				$.ajax({
					url: "/franchise/store/proc.pwd.php",
					type: "POST",
					timeout: 10000,
					data: $("#frmMember").serialize(),
					dataType: "html",
					success: function(data){
						if(data == "0000"){
							alert("비밀번호가 변경되었습니다.");
							Newriver.Util.AjaxPopup('close');
						}
						else if(data == "2222"){
							alert("새 비밀번호와 비밀번호 확인이 불일치 합니다.");
						}
						else if(data == "3333"){
							alert("기존 비밀번호를 확인해 주세요.");
						}
						else{
							location.href = "login.php";
						}
					},
					error: function(xhr){
						alert('['+xhr.status+'] 서버전송오류가 발생했습니다.');
					}
				});
			} catch(e){
				alert(e.description);
			}
		}
	},

	MovePwd : function(){
		Newriver.Util.AjaxPopup('close');
		Newriver.Util.AjaxPopup('open', '/common/mpwd.php');
	}
}

Login = {
	Init : function(){
		$(document).ready(function(){
			$("#loginform").submit(function(){
				if(!$("#id").val()){
					alert("아이디를 입력해 주세요.");
					return false;
				}

				if(!$("#pwd").val()){
					alert("비밀번호를 입력해 주세요.");
					return false;
				}
			});

			var saveid = Common.GetCookie("saveid");
			$("input[name='id']").val(saveid);

			if($("input[name='id']").val() != ""){
				$("#saveid").attr("checked", true);
				$("#saveid").parent().addClass("on");
			}

			$("#saveid").change(function(){
				if($("#saveid").is(":checked")){
					var saveid = $("input[name='id']").val();
					Common.SetCookie("saveid", saveid, 7);
				}else{
					Common.DeleteCookie("saveid");
				}
			});

			$("input[name='id']").keyup(function(){
				if($("#saveid").is(":checked")){
					var saveid = $("input[name='id']").val();
					Common.SetCookie("saveid", saveid, 7);
				}
			});
		});
	}
}

Common = {
	SetCookie : function(cookieName, value, exdays){
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var cookieValue = escape(value) + ((exdays==null) ? "" : "; expires=" + exdate.toGMTString());
		document.cookie = cookieName + "=" + cookieValue;
	},

	DeleteCookie : function(cookieName){
		var expireDate = new Date();
		expireDate.setDate(expireDate.getDate() - 1);
		document.cookie = cookieName + "= " + "; expires=" + expireDate.toGMTString();
	},

	GetCookie : function(cookieName) {
		cookieName = cookieName + '=';
		var cookieData = document.cookie;
		var start = cookieData.indexOf(cookieName);
		var cookieValue = '';
		if(start != -1){
			start += cookieName.length;
			var end = cookieData.indexOf(';', start);
			if(end == -1)end = cookieData.length;
			cookieValue = cookieData.substring(start, end);
		}
		return unescape(cookieValue);
	}
}

SQNA = {
	Init : function(){

		$("#frmWrite").submit(function(){
			if(!FormCheck.Check("frmWrite")) return false;

			if(confirm("작성하신 내용을 저장하시겠습니까?")) return true;
			else return false;
		});
	}
}

Award = {
	Init : function(){
		$("#email3").change(function(){
			if($(this).val() == "direct"){
				$("#email2").css("display", "block");
				$("#email2").val("");
			}
			else{
				$("#email2").css("display", "none");
				$("#email2").val($(this).val());
			}
		});

		$("#frmWrite").submit(function(){
			if(!FormCheck.Check("frmWrite")) return false;

			if(!$("#agree1_y").prop("checked")){
				alert("개인정보 수집 약관에 동의해 주세요.");
				return false;
			}

			if(!$("#agree2_y").prop("checked")){
				alert("개인정보 제 3자 제공에 동의해 주세요.");
				return false;
			}

			var email = $("#email1").val() + "@" + $("#email2").val();
			if(!Customer.EmailCheck(email)){
				alert("형식에 맞지 않는 이메일주소 입니다.");
				$("#email1").focus();
				return false;
			}

			$("#etc2").val(email);

			var phone = $("#phone1").val() + "-" + $("#phone2").val() + "-" + $("#phone3").val();
			$("#etc4").val(phone);

			if(confirm("작성하신 내용을 저장하시겠습니까?")) return true;
			else return false;
		});
	},

	EmailCheck : function(email) {
		var regex=/([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
		return (email != '' && email != 'undefined' && regex.test(email));
	},


	StoreSearch : function(){

		try {
			$.ajax({
				url: "/brand/store/store.php?m=popup",
				type: "POST",
				data: $("#frmSearch").serialize(),
				timeout: 10000,
				dataType: "html",
				success: function(html){

					if($.trim(html)!=""){
						$("#storeList_no_data").css("display", "none");
						$("#storeList > tbody").empty();
						$("#storeList > tbody").append(html);
						$("#storeList").css("display", "table");
					}
					else{
						$("#storeList > tbody").empty();
						$("#storeList").css("display", "none");
						$("#storeList_no_data p").html("검색 결과가 없습니다.");
						$("#storeList_no_data").css("display", "block");
					}
				},
				error: function(xhr){
					alert('['+xhr.status+'] 서버전송오류가 발생했습니다.');
				}
			});
		} catch(e){
			alert(e.description);
		}
	},

	Address: function() {
		new daum.Postcode({
			oncomplete: function(data) {
				var addr = data.address;
				if(data.buildingName) addr += ' ('+data.buildingName+')';
				$("#etc5").val(data.zonecode);
				$("#etc6").val(addr);
				$("#etc7").focus();
			}
		}).open();
	}
}