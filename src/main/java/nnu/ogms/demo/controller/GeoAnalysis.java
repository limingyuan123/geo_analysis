package nnu.ogms.demo.controller;

import com.sun.org.apache.bcel.internal.generic.RET;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

/**
 * @Author mingyuan
 * @Date 2020.11.20 16:15
 */
@RestController
public class GeoAnalysis {
    @RequestMapping("map")
    public ModelAndView loadMap(){
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("map");
        return modelAndView;
    }
}
