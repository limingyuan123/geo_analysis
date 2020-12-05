package nnu.ogms.demo.controller;

import com.sun.org.apache.bcel.internal.generic.RET;
import nnu.ogms.demo.bean.JsonResult;
import nnu.ogms.demo.service.GeoAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpRequest;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletResponse;

import java.io.File;

import static utils.MultipartFileUtils.delteTempFile;
import static utils.MultipartFileUtils.multipartFileToFile;

/**
 * @Author mingyuan
 * @Date 2020.11.20 16:15
 */
@RestController
public class GeoAnalysisController {
    @Autowired
    GeoAnalysisService geoAnalysisService;

    @RequestMapping(value={"/","/map"},method = RequestMethod.GET)
    public ModelAndView loadMap(){
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("map");
        return modelAndView;
    }

    @RequestMapping(value = "/tileSplice",method = RequestMethod.GET)
    public JsonResult tileSplice(HttpServletResponse response) throws Exception {
        JsonResult jsonResult = new JsonResult();
        File file1 = new File("C:\\Users\\HP\\Desktop\\文件\\AI.png");
//        File file1 = multipartFileToFile(file);

//        try {
//            Thread.sleep(1000);
//        } catch (InterruptedException e) {
//            e.printStackTrace();
//        }

        //数据处理
        /*************************************/
        //将处理结果下载
        if(file1.exists()) {
            geoAnalysisService.downloadFile(response, file1, "res");
        }

//        delteTempFile(file1);

        return jsonResult;
    }
}
