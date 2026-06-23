package com.vibgyor.ecommerce.util;

import com.vibgyor.ecommerce.entity.Product;
import com.vibgyor.ecommerce.entity.ProductImage;

public class ProductImageUtil {

    private ProductImageUtil() {}

    public static String extractPrimaryImageUrl(Product product) {
        if (product == null || product.getImages() == null || product.getImages().isEmpty()) {
            return null;
        }
        return product.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElseGet(() -> product.getImages().stream()
                        .findFirst()
                        .map(ProductImage::getImageUrl)
                        .orElse(null));
    }
}