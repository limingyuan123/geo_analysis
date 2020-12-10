package nnu.ogms.demo.dao;

import nnu.ogms.demo.entity.ClipResult;
import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * @Author mingyuan
 * @Date 2020.12.09 22:02
 */
public interface ClipResultDao extends MongoRepository<ClipResult, String> {
    ClipResult findFirstByOid(String oid);
}
