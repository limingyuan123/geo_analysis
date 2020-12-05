package nnu.ogms.demo.bean;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * @Author mingyuan
 * @Date 2020.12.04 19:53
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JsonResult<T> implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer code=0;
    private String msg="success";
    private T data;
}
