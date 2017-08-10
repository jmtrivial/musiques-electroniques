/* global d3 */

function getParam(sname) {
  var params = location.search.substr(location.search.indexOf("?")+1);
  var sval = "";
  params = params.split("&");
    // split param and value into individual pieces
    for (var i=0; i<params.length; i++)
       {
         temp = params[i].split("=");
         if ( [temp[0]] == sname ) { sval = temp[1]; }
       }
  return sval;
}

function getSelectedElement() {
	return getParam("e");
}

function majFirstChar(a) {
	return a.charAt(0).toUpperCase() + a.substr(1);

}

function formatWithParticule1(a) {
		if (!a)
			return "";
		if (a.slice(-1) == '\'') {
				return a;
		}
		else 
			return a + " ";
}

function formatWithParticule2(a, b) {
		var finalA = formatWithParticule1(a);
		var finalB = formatWithParticule1(b);		

		if (finalB == "le " && finalA.slice(-3) == "de ") {
			if (finalA.length == 3) {
				return "du ";
			}
			else {
				if (finalA.slice(-4) != " de ")
					return finalA + finalB;
				else {
					var startA = finalA.substr(0, finalA.length - 4);
					return startA + " du ";
				}
			}
		}
		else if (finalB == "les " && finalA.slice(-3) == "de ") {
			if (finalA.length == 3) {
				return "des ";
			}
			else {
				if (finalA.slice(-4) != " de ")
					return finalA + finalB;
				else {
					var startA = finalA.substr(0, finalA.length - 4);
					return startA + " des ";
				}
			}
		}
		else
			return finalA + finalB;
}

function formatWithParticule3(a, b, c) {
		var finalA = formatWithParticule2(a, b);
		return formatWithParticule2(finalA, c);
}

function addInMenus(nodes) {
	
		var descList = $("#description-list");
		var selected = getSelectedElement();
		if (selected)
			descList.append("<option value=\"\">Sélectionner un élément</option>");
		else
			descList.append("<option value=\"\" selected=\"selected\">Sélectionner un élément</option>");
		
		nodes.sort(function(a, b) {
			var A = a.name;
			var B = b.name;
			return (A < B) ? -1 : (A > B) ? 1 : 0;
		});
		
		nodes.forEach(function(n) { 
				if (selected == n.id)
					descList.append("<option value=\""+n.id+"\" selected=\"selected\">"+majFirstChar(formatWithParticule1(n.particule)) + (n.name)+"</option>");
				else
					descList.append("<option value=\""+n.id+"\">"+majFirstChar(formatWithParticule1(n.particule)) + n.name+"</option>");
			
		});
}



d3.json("electronique.json", function(error, graph) {
  if (error) throw error;

		
	var selected = getSelectedElement();
	/* */
	addInMenus(graph.nodes);
	

	const mouseOverFunction = function (d) {
		if (selected == "")
			activateNode(d);
	};
	
	var activateNode = function(d) {

		node
			.transition(500)
			.style('opacity', o => {
				const isConnectedValue = isConnected(o, d);
				if (isConnectedValue) {
				return 1.0;
				}
				return 0.4
			});
		node
			.select("circle")
			.transition(500)
			.attr('r', o => (o === d ? 10 : 5));
		node
			.select("text")
			.transition(500)
			.style("font-size", o => (o === d ? "15px" : "8px"));

			
		link
			.transition(500)
			.style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : 0.3))
			.transition(500)
			.attr('marker-end', o => (o.source === d || o.target === d ? 'url(#arrowhead)' : 'url()'));	
	};

	var desactivateNode = function() {

		node
			.transition(500)
			.style('opacity', 0.4);
		node
			.select("circle")
			.transition(500)
			.attr('r', 5);
			
		node
			.select("text")
			.transition(500)
			.style("font-size", "12px");

			
		link
			.transition(500)
			.style('stroke-opacity', 0.3)
			.transition(500)
			.attr('marker-end', 'url()');				
		nodes.filter(function(d) { return d.id; }).forEach(function (dd) { dd.fx = null; dd.fy = null; }); 

	}
	
	const mouseOutFunction = function () {
		if (selected == "")
			desactivateNode();

	};

	const nodes = graph.nodes;
	const links = graph.links;
	const refs = graph.refs;
	var nodeById = d3.map(nodes, function(d) { return d.id; });
	
	var refById = d3.map(refs, function(r) { return r.id; });
	

			

	var simulation = d3.forceSimulation()
	.force('link', d3.forceLink().id(d => d.id))
	.force('charge', d3.forceManyBody().strength(-700));


	const svg = d3.select('#graph').append('svg');
	
		var margin = 5;
	var viewerWidth, viewerHeight;

	var resize = function() {
		viewerWidth = parseInt(d3.select("#graph").style("width")) - margin*2,
		viewerHeight = parseInt(d3.select("#graph").style("height")) - margin*2;
	
		simulation.force("center", d3.forceCenter(viewerWidth / 2, viewerHeight / 2))
		svg.attr("width", viewerWidth)
			.attr("height", viewerHeight);
		if (maing) {
			maing.attr("width", viewerWidth)
				.attr("height", viewerHeight);
		}
	}
	
	d3.select(window).on('resize', resize); 
	/* first resize */
	resize();
	
	var zoom = d3.zoom()
      .scaleExtent([1 / 2, 4])
      .on("zoom", zoomed);
	  
	svg.append("rect")
    .attr("width", viewerWidth)
    .attr("height", viewerHeight)
    .style("fill", "none")
    .style("pointer-events", "all")
    .call(zoom);

	var myScale = 1.;

	 function zoomed() {
		myScale = d3.event.transform.k;
		if (myX) {
			d3.event.transform.x = myX;
			d3.event.transform.y = myY;
			myX = null;
			myY = null;
		}
		maing.attr("transform", d3.event.transform);
	}
	
	var maing = svg.append("g");

	var color = d3.scaleOrdinal(d3.schemeCategory20);

	
	let link = maing.selectAll('line')
	.data(graph.links)
	.enter().append('line');

	let node = maing.selectAll('.node')
	.data(graph.nodes)
	.enter().append("g")
		.attr('class', 'node');
		
	node
		.append('circle')
		.attr("r", 5)
		.attr("fill", function(d) { return color(d.type); })
		.on('mouseover', mouseOverFunction)
		.on('mouseout', mouseOutFunction)
		.call(d3.drag()
		.on("start", dragstarted)
		.on("drag", dragged)
		.on("end", dragended));

	node
		.append('text')
		.attr("class", "node-text")
		.attr("x", 12)
		.attr("dy", ".35em")
		.text(function(d) { return d.name; });
		
	svg
	.append('marker')
	.attr('id', 'arrowhead')
	.attr('refX', 9)
	.attr('refY', 2)
	.attr('markerWidth', 6)
	.attr('markerHeight', 4)
	.attr('orient', 'auto')
	.append('path')
		.attr('d', 'M 0,0 V 4 L6,2 Z');

	link
	.attr('marker-end', 'url()');

	simulation
	.nodes(graph.nodes)
	.on('tick', ticked);

	simulation.force('link')
	.links(graph.links);

	let linkedByIndex = {};
	links.forEach((d) => {
	linkedByIndex[`${d.source.index},${d.target.index}`] = true;
	});
	
	let linksFromNodes = {};
	links.forEach((d) => {
		linksFromNodes[`${d.source.index},${d.target.index}`] = d;
	});

	function isConnected(a, b) {
	return isConnectedAsTarget(a, b) || isConnectedAsSource(a, b) || a.index === b.index;
	}

	function isConnectedAsSource(a, b) {
	return linkedByIndex[`${a.index},${b.index}`];
	}

	function isConnectedAsTarget(a, b) {
	return linkedByIndex[`${b.index},${a.index}`];
	}

	function isEqual(a, b) {
	return a.index === b.index;
	}
	
	function getLinkFromNodes(a, b) {
			return linksFromNodes[`${b.index},${a.index}`];
	}

	function ticked() {
	link
		.attr('x1', d => d.source.x)
		.attr('y1', d => d.source.y)
		.attr('x2', d => d.target.x)
		.attr('y2', d => d.target.y);

	node
		.attr('transform', d => `translate(${d.x},${d.y})`);
	}

	function dragstarted(d) {
		if (!d3.event.active) simulation.alphaTarget(0.3).restart();
		nodes.filter(function(d) { return d.id; }).forEach(function (dd) { dd.fx = null; dd.fy = null; });
		d.fx = d.x;
		d.fy = d.y;
	}

	function dragged(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
	}

	function dragended(d) {
		if (!d3.event.active) simulation.alphaTarget(0);
		setSeletedElement(d.id);
	}
	

	var myX = null;
	var myY = null;
	var centerOnNode = function (idElement) {
		var n = nodeById["$"+idElement];
		var scale = myScale;
		myX = viewerWidth / 2 - n.x * scale;
		myY = viewerHeight / 2 - n.y * scale;
		maing.attr("transform", "translate(" + myX + ", " + myY + ") scale(" + scale + ")");		
	}

	setSeletedElement = function (idElement) {
		/* affichage latéral */
		$("#description-list").val(idElement);  
		
		
		/* affichage noeud */
		if (idElement == "") {
			desactivateNode();
		}
		else {
			activateNode(nodeById["$"+idElement]);
		}
		
		// changement de l'adresse
		if (idElement == "") {
			var stateObj = { e: "" };
			history.pushState(stateObj, "Accueil", "/");
			document.title = "Éléments d'histoire de la musique électronique";
		}
		else {
			var stateObj = { e: idElement };
			history.pushState(stateObj, "idElement", "/?e=" + idElement);
			var title = nodeById["$"+idElement].name;
			document.title = "Éléments d'histoire de la musique électronique | " + title;
		}
		
		if (idElement == "") {
				clearPanel();
		}
		else {
				fillPanel(nodeById["$"+idElement]);
		}

		
		selected = idElement;
		
		
	};
	
	setSeletedElementCenter = function(v) {
		setSeletedElement(v);
		if (v != "")
			centerOnNode(v);
	};
	
	var clearPanel = function() {
		$("#description-complete").replaceWith("<div id=\"description-complete\"></div>");
		inPanel = null;
	}
	
	var inPanel = null;
	var fillPanel = function(n) {
		
		if (inPanel && inPanel == n.id)
			return;
		
		clearPanel();
		inPanel = n.id;


		if (n.description)
			$("#description-complete").append("<p>" + n.description + "</p>");
	
		if (n.illustrationImage)
			$("#description-complete").append("<div><img class=\"img-rounded img-responsive\" src=\"" + n.illustrationImage + "\" alt=\"Illustration " + n.name + "\" /></div>");
		
		if (n.illustrationVideo) 
			$("#description-complete").append("<div class=\"videowrapper\">" +  n.illustrationVideo + "</div>");

		
		var hasAdjNodes = false;
		e = $("<ul id=\"noeuds-voisins\"></ul>");
		nodes
			.forEach(function(d) {
				if (isConnected(n, d) && !isEqual(n, d)) {
					
					var link = getLinkFromNodes(d, n);
					var prefix = "";
					if (link) {
						var particule = n.particule;
						prefix = formatWithParticule2(particule, n.name) + " " + link.name;
					}

					var invlink = getLinkFromNodes(n, d);
					var suffix = "";
					if (invlink) {
						var particule = n.particule;
						suffix = " " + formatWithParticule3(invlink.name, particule, n.name);
					}
					var dparticule = d.particule;

					
					e.append("<li>" + majFirstChar(formatWithParticule2(prefix, dparticule)) + "<a onclick=\"setSeletedElementCenter('"+d.id + "')\">" + d.name + "</a>" + suffix + "</li>");
					hasAdjNodes = true;
				}
			});

		if (hasAdjNodes) {
			$("#description-complete").append("<h4>Éléments connectés</h4>");
			$("#description-complete").append(e);
		}
		
		
		var hasRefs = false;
		rs = $("<ul id=\"references\"></ul>");
		if (n.refs) {
			n.refs.forEach(function (r) {
				lr = refById["$" + r];
				
				if (lr.type == "book") {
					if (lr.url)
						rs.append("<li><span class=\"glyphicon glyphicon-book\" aria-hidden=\"true\"></span> " + lr.author + ", <em><a href=\"" + lr.url + "\">" + lr.title + "</a></em>, " + lr.editor + ", " + lr.date + "</li>");
					else
						rs.append("<li><span class=\"glyphicon glyphicon-book\" aria-hidden=\"true\"></span> " + lr.author + ", <em>" + lr.title + "</em>, " + lr.editor + ", " + lr.date + "</li>");
				}
				else if (lr.type == "podcast") {
					var d = "";
					if (lr.date)
						d = ", " + lr.date;
					rs.append("<li><a title=\"podcast\" href=\"" + lr.url + "\"><span class=\"glyphicon glyphicon-play-circle\" aria-hidden=\"true\"></span> " + lr.title + "</a>" + d + "</li>");
				}
				else if (lr.type == "website") {
					rs.append("<li><a title=\"site internet\" href=\"" + lr.url + "\"><span class=\"glyphicon glyphicon-globe\" aria-hidden=\"true\"></span> " + lr.title + "</a></li>");
				}
				else if (lr.type == "conference") {
					rs.append("<li><a title=\"site internet\" href=\"" + lr.url + "\"><span class=\"glyphicon glyphicon-bullhorn\" aria-hidden=\"true\"></span> " + lr.title + "</a>, " + lr.author + "</li>");
				}
				else if (lr.type == "discogs") {
					rs.append("<li><a title=\"discogs\" href=\"" + lr.url + "\"><span class=\"glyphicon glyphicon-cd\" aria-hidden=\"true\"></span> " + lr.title + "</a> sur Discogs</li>");
				}
				else {
					rs.append("<li>" + lr.title + "</li>");
				}
				hasRefs = true;
			});
		}
		if (hasRefs) {
			$("#description-complete").append("<h4>Références et liens</h4>");
			$("#description-complete").append(rs);
		}
	}
	
	setSeletedElement(selected);
	

	
	$("#description-list").change (function() {
		setSeletedElementCenter(this.value);
	});

});




