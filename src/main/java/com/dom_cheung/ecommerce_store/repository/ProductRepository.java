package com.dom_cheung.ecommerce_store.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.dom_cheung.ecommerce_store.model.Product;
import org.springframework.stereotype.Repository;
@Repository

public interface ProductRepository extends JpaRepository<Product, Long> {
    // JpaRepository<EntityType, PrimaryKeyType>
    // now got CRUD method such as (findAll, findById, save, deleteById etc)
}
