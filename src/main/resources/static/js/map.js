var app = new Vue({
    el:"#app",
    data() {
        return {
            windowHeight: window.innerHeight,
            windowWidth: window.innerWidth - 60,
            modalExport: false,
            modalImport: false,
            map: null,
            baseLayers: null,
            traces: {},
            geojsonBlob: null,
            //存储绘制的图像layer
            drawingLayerGroup: null,
            participants: [],
            resources: [],
            dataUrl: "",
            formValidate: {
                fileName: "",
                fileDescription: ""
            },
            ruleValidate: {
                fileName: [
                    { required: true, message: "Please select type...", trigger: "blur" }
                ],
                fileDescription: [
                    { required: false, message: "Drawing tool", trigger: "blur" }
                ]
            },
            dialogVisible: false,
            zoom:"",
            coordinates:"",
            geoJSON:"",
            activeName: 'first',
            loading: false
        }
    },
    mounted() {
        window.addEventListener("resize", this.initSize);
        this.initSize();
        this.initMap();
        this.initLayer();
        this.initControl();
        this.listenDraw();
    },
    beforeDestroy() {
        window.removeEventListener("resize", this.initSize);
    },
    methods: {
        handleClick(tab, event) {
            console.log(tab, event);
        },
        initSize() {
            $("#app").css("min-width", "0");
            $("#app").css("min-height", "0");
            this.windowHeight = window.innerHeight;
            this.windowWidth = window.innerWidth - 60;
        },
        handleClose(done) {
            this.$confirm('确认关闭？')
                .then(_ => {
                    done();
                })
                .catch(_ => {});
        },
        initMap() {
            this.tdtVectorMap =
                "http://t0.tianditu.gov.cn/vec_w/wmts?tk=d6b0b78f412853967d91042483385d2c" +
                "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";
            this.tdtVectorAno =
                "http://t0.tianditu.gov.cn/cva_w/wmts?tk=d6b0b78f412853967d91042483385d2c" +
                "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";
            this.tdtImgMap =
                "http://t0.tianditu.gov.cn/img_w/wmts?tk=d6b0b78f412853967d91042483385d2c" +
                "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";
            this.tdtImgAno =
                "http://t0.tianditu.gov.cn/cia_w/wmts?tk=d6b0b78f412853967d91042483385d2c" +
                "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";
            this.tdtTerrMap =
                "http://t0.tianditu.com/ter_w/wmts?tk=d6b0b78f412853967d91042483385d2c" +
                "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";
            this.tdtTerrAno =
                "http://t0.tianditu.com/cta_w/wmts?tk=d6b0b78f412853967d91042483385d2c" +
                "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";

            this.map = L.map("leadletMap", {
                crs: L.CRS.EPSG3857,
                center: L.latLng(32.07, 118.78),
                zoom: 13
            });
        },
        initLayer() {
            this.drawingLayerGroup = L.layerGroup([]);
            this.drawingLayerGroup.addTo(this.map);
        },
        initControl() {
            // 图层控件
            var vectorMap = L.tileLayer(this.tdtVectorMap, {
                maxZoom: 20,
                attribution:
                    '&copy; <a href="http://map.tianditu.gov.cn/">tianditu</a> contributors'
            });
            var vectorAno = L.tileLayer(this.tdtVectorAno, { maxZoom: 18 });
            var vector = L.layerGroup([vectorMap, vectorAno]);

            var satelliteMap = L.tileLayer(this.tdtImgMap, {
                maxZoom: 18,
                attribution:
                    '&copy; <a href="http://map.tianditu.gov.cn/">tianditu</a> contributors'
            });
            var satelliteAno = L.tileLayer(this.tdtImgAno, { maxZoom: 18 });
            var satellite = L.layerGroup([satelliteMap, satelliteAno]);

            var terrainMap = L.tileLayer(this.tdtTerrMap, {
                maxZoom: 18,
                attribution:
                    '&copy; <a href="http://map.tianditu.gov.cn/">tianditu</a> contributors'
            });
            var terrainAno = L.tileLayer(this.tdtTerrAno, { maxZoom: 18 });
            var terrain = L.layerGroup([terrainMap, terrainAno]);

            this.baseLayers = {
                "Vector map": vector,
                "Satellite map": satellite,
                "Terrain map": terrain
            };
            var overlayLayers = {};
            L.control.layers(this.baseLayers, overlayLayers).addTo(this.map);
            this.baseLayers["Vector map"].addTo(this.map);

            // 比例尺
            L.control
                .scale({
                    position: "bottomleft"
                })
                .addTo(this.map);

            // 鹰眼
            var normal = L.tileLayer(this.tdtVectorMap, { maxZoom: 18 });
            var miniMap = new L.Control.MiniMap(normal, {
                // toggleDisplay: true,
                minimized: false,
                position: "bottomleft"
            }).addTo(this.map);

            // 绘图控件
            var options = {
                position: "topleft", // toolbar position, options are 'topleft', 'topright', 'bottomleft', 'bottomright'
                drawMarker: true, // adds button to draw markers
                drawPolyline: true, // adds button to draw a polyline
                drawRectangle: true, // adds button to draw a rectangle
                drawPolygon: true, // adds button to draw a polygon
                drawCircle: true, // adds button to draw a cricle
                cutPolygon: false, // adds button to cut a hole in a polygon
                editMode: true, // adds button to toggle edit mode for all layers
                dragMode: false,
                removalMode: true // adds a button to remove layers
            };
            this.map.pm.addControls(options);
        },
        downloadGeoJson(name) {
            this.$refs[name].validate(valid => {
                if (valid) {
                    var reader = new FileReader();
                    if (this.geojsonBlob != null) {
                        let filename = "";
                        if (!/\.(json)$/.test(this.formValidate.fileName.toLowerCase())) {
                            filename = this.formValidate.fileName + ".json";
                        } else {
                            filename = this.formValidate.fileName;
                        }
                        reader.readAsDataURL(this.geojsonBlob);
                        reader.onload = function(e) {
                            var a = document.createElement("a");
                            a.download = filename;
                            a.href = e.target.result;
                            $("body").append(a);
                            a.click();
                            $(a).remove();
                        };
                    }
                } else {
                    this.$Message.error("Please enter the necessary information!");
                }
            });
        },


        listenDraw() {
            // this.send_content = {};
            let isMouseDown = false;
            let isZoomControl = false;
            let isDoubleClick = false;
            let isLayerCtrlClick = false;

            this.map.on("mousedown", e => {
                isMouseDown = true;
            });

            this.map.on("mouseup", e => {
                isLayerCtrlClick = true;
            });

            this.map.on("dblclick", e => {
                isDoubleClick = true;
            });

            //缩放控件事件
            var element = document.querySelector("a.leaflet-control-zoom-in");
            L.DomEvent.addListener(element, "click", function(e) {
                isZoomControl = true;
            });
            element = document.querySelector("a.leaflet-control-zoom-out");
            L.DomEvent.addListener(element, "click", function(e) {
                isZoomControl = true;
            });

            // 图层控件
            this.map.on("baselayerchange", e => {
                if (isLayerCtrlClick) {
                }
                isLayerCtrlClick = false;
            });

            //缩放事件 与 鼠标事件同时发生
            this.map.on("zoomend", e => {
                if (this.map.scrollWheelZoom || isZoomControl || isDoubleClick) {
                    isZoomControl = false;
                    isDoubleClick = false;
                }
            });

            //地图拖拽事件
            this.map.on("moveend", e => {
                isMouseDown = false;
            });


            // 删除事件
            let _this = this;
            this.map.on("pm:remove", e => {
                _this.drawingLayerGroup.removeLayer(e.layer);
            });

            this.map.on("pm:globaleditmodetoggled", e => {
            });

            // 画图事件
            this.map.on("pm:create", e => {
                this.map.removeLayer(e.layer);
                if (e.shape == "Circle") {
                    this.traces = [];
                    let points = e.layer._latlng;
                    this.traces.push(points);
                    let radius = e.layer._mRadius;
                    this.traces.push(radius);

                    let drawingLayer = L.circle(points, {
                        radius: radius
                    });
                    this.drawingLayerGroup.addLayer(drawingLayer);
                } else {
                    this.drawingLayerGroup.addLayer(e.layer);
                }
                this.geoJSON = JSON.stringify(e.layer.toGeoJSON(),null,4);
                this.dialogVisible = true;
                this.geojsonBlob = new Blob(
                    [this.geoJSON],
                    {type:"application/json"}
                );
                this.modalExport = true;
            });
        },

        selecetResource(url) {
            this.dataUrl = url;
        },
        tileSplice1(){
            let _this = this;
            this.loading = true;
            let file = new File([this.geoJSON],'geojson.txt',{
                type:'text/plain'
            });
            let formdata = new FormData();
            formdata.append("geojson",file);
            $.ajax({
                url:"/tileSplice",
                type:"POST",
                processData:false,
                contentType:false,
                data:formdata,
                success:(result)=>{
                    this.loading = false;
                    if(result.code === 0){
                        var oid = result.data;
                        //下载数据
                        window.location.href = "/downloadResult/" + oid;
                    }
                    _this.$message({
                        message:"Invoke success",
                        type:"success"
                    });
                }
            })
        },
        tileSplice(){
            let _this = this;
            this.loading = true;
            let file = new File([this.geoJSON],'geojson.txt',{
                type:'text/plain'
            });
            let formdata = new FormData();
            formdata.append("geojson",file);
            this.loading = false;
            $.ajax({
                url:"/tileSplice1",
                type:"POST",
                processData:false,
                contentType:false,
                data:formdata,
                success:(result)=>{
                    this.loading = false;
                    if(result.code === 0){
                        var oid = result.data.data;
                        //下载数据
                        window.location.href = "/downloadResult/" + oid;
                    }
                    _this.$message({
                        message:"Invoke success",
                        type:"success"
                    });
                }
            })
        }
    }
})