package nnu.ogms.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

import java.util.Date;

/**
 * @Author mingyuan
 * @Date 2020.12.09 20:43
 */
@Document
@Data
public class ClipResult {
    @Id
    String oid;
    Date clipTime;
    String outPath;
    String fileName;
}
