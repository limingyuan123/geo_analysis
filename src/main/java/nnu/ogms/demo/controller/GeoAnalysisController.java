package nnu.ogms.demo.controller;

import com.alibaba.fastjson.JSONObject;
import lombok.extern.slf4j.Slf4j;
import nnu.ogms.demo.bean.JsonResult;
import nnu.ogms.demo.dao.ClipResultDao;
import nnu.ogms.demo.entity.ClipResult;
import nnu.ogms.demo.service.GeoAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletResponse;

import java.io.*;
import java.util.Date;
import java.util.UUID;


/**
 * @Author mingyuan
 * @Date 2020.11.20 16:15
 */
@RestController
@Slf4j
public class GeoAnalysisController {
    @Autowired
    GeoAnalysisService geoAnalysisService;

    @Autowired
    ClipResultDao clipResultDao;

    @Value("${resourcePath}")
    private String resourcePath;

    @Value("${dataAnalysisApi}")
    private String dataAnalysisApi;

    @RequestMapping(value={"/","/map"},method = RequestMethod.GET)
    public ModelAndView loadMap(){
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("map");
        return modelAndView;
    }

    @RequestMapping(value = "/tileSplice",method = RequestMethod.POST)
    public JsonResult tileSplice(@RequestParam(value = "geojson") MultipartFile file){
        JsonResult jsonResult = new JsonResult();

        String oid = UUID.randomUUID().toString();
        //将geojson数据上传到指定路径
        String path = resourcePath + "/test/";

        File localFile = new File(path);
        if(!localFile.exists()){
            localFile.mkdirs();
        }
        String fileName = file.getOriginalFilename();
        String geojsonPath = path + "/" + fileName;
        localFile = new File(geojsonPath);
        FileOutputStream fos = null;
        InputStream in = null;
        try {
            if (!localFile.exists()) {
                //如果文件不存在，则创建新的文件
                localFile.createNewFile();
                log.info("Create file successfully,the file is {}", path);
            }
            //创建文件成功后，写入内容到文件里
            fos = new FileOutputStream(localFile);
            in = file.getInputStream();

            byte[] bytes = new byte[1024];
            int len = -1;
            while ((len = in.read(bytes)) != -1) {
                fos.write(bytes, 0, len);
            }
            fos.flush();
            log.info("Reading uploaded file and buffering to local successfully!");
        } catch (IOException e) {
            e.printStackTrace();
        }finally {
            try {
                if (fos != null) {
                    fos.close();
                }
                if (in != null) {
                    in.close();
                }
            }catch (IOException e) {
                log.error("InputStream or OutputStream close error : {}", e);
            }
        }

        String outPath = resourcePath + "/test" + "/query_dem.tif";
        String catalogPath = "/home/geoanalysis/output/catalog";
        //调用脚本处理数据
        try {
            String[] args = new String[]{"python", resourcePath + "/get_dem.py", catalogPath, "dem", geojsonPath, outPath};
            log.info("args[0]:  " + args[0]);
            log.info("args[1]:  " + args[1]);
            log.info("args[2]:  " + args[2]);
            log.info("args[3]:  " + args[3]);
            log.info("args[4]:  " + args[4]);
            log.info("args[5]:  " + args[5]);
            log.info("input: " + path + "outPath: " + outPath);
            Process process = Runtime.getRuntime().exec(args);
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line = null;
            while ((line = bufferedReader.readLine())!=null){
                System.out.println(line);
            }
            bufferedReader.close();
            int r = process.waitFor();
            log.info("success invoke python script + r: " + r);

        }catch (IOException | InterruptedException e){
            e.printStackTrace();
        }
        ClipResult clipResult = new ClipResult();
        clipResult.setOid(oid);
        Date date = new Date();
        clipResult.setClipTime(date);
        clipResult.setOutPath(outPath);
        clipResult.setFileName("query_dem.tif");
        clipResultDao.save(clipResult);
        jsonResult.setCode(0);
        jsonResult.setData(oid);
        return jsonResult;
    }

    /**
     * 本地测试使用跨域
     * @param file
     * @return
     */
    @RequestMapping(value = "/tileSplice1",method = RequestMethod.POST)
    public JsonResult tileSplice1(@RequestParam(value = "geojson") MultipartFile file){
        JsonResult jsonResult = new JsonResult();

        String url="http://"+ dataAnalysisApi +"/tileSplice";
        RestTemplate restTemplate = new RestTemplate();
        MultiValueMap<String, Object> part = new LinkedMultiValueMap<>();
        part.add("geojson",file.getResource());

        JSONObject jsonObject = restTemplate.postForObject(url, part, JSONObject.class);
        part = null;
        file = null;
        if(jsonObject.getIntValue("code") == -1){
            log.info("远程服务出错");
        }
        jsonResult.setData(jsonObject);
        return jsonResult;
    }

    @RequestMapping(value = "/downloadResult/{oid}", method = RequestMethod.GET)
    public void downloadResult(@PathVariable(value = "oid") String oid,HttpServletResponse response) throws UnsupportedEncodingException {
//        File file1 = new File("C:\\Users\\HP\\Desktop\\文件\\AI.png");
        ClipResult clipResult = clipResultDao.findFirstByOid(oid);
        String outPath = clipResult.getOutPath();
        String fileName = clipResult.getFileName();
        File file = new File(outPath);

        //将处理结果下载
        if(file.exists()) {
            geoAnalysisService.downloadFile(response, file, fileName);
        }
    }
}
