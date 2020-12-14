package nnu.ogms.demo.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.nio.charset.StandardCharsets;

/**
 * @Author mingyuan
 * @Date 2020.12.04 20:34
 */
@Service
@Slf4j
public class GeoAnalysisService {
    public void downloadFile(HttpServletResponse response, File file, String fileName) throws UnsupportedEncodingException {
        log.info("文件大小" + file.length());

        response.setContentType("application/force-download");
        response.setContentLength((int) file.length());
        response.addHeader("Content-Disposition", "attachment;fileName=" + new String(fileName.getBytes(StandardCharsets.UTF_8),
                "ISO8859-1"));
        byte[] buffer = new byte[1024];
        FileInputStream fis = null;
        BufferedInputStream bis = null;
        try {
            fis = new FileInputStream(file);
            bis = new BufferedInputStream(fis);
            OutputStream outputStream = response.getOutputStream();
            int i = bis.read(buffer);
            while (i != -1) {
                outputStream.write(buffer, 0, i);
                i = bis.read(buffer);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (bis != null) {
                try {
                    bis.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            if (fis != null) {
                try {
                    fis.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}