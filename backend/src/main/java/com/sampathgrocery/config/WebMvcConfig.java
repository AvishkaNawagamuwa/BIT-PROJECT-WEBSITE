package com.sampathgrocery.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC Configuration for serving HTML templates and static resources
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve HTML files from templates folder
        registry.addResourceHandler("/*.html")
                .addResourceLocations("classpath:/templates/")
                .setCachePeriod(0);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Redirect root to login page
        registry.addViewController("/").setViewName("redirect:/login");

        // Authentication Pages
        registry.addViewController("/login").setViewName("forward:/login.html");
        registry.addViewController("/register").setViewName("forward:/register.html");

        // Main Application Pages
        registry.addViewController("/dashboard").setViewName("forward:/dashboard.html");
        registry.addViewController("/inventory").setViewName("forward:/inventory.html");
        registry.addViewController("/pos").setViewName("forward:/pos.html");
        registry.addViewController("/orders").setViewName("forward:/orders.html");
        registry.addViewController("/customers").setViewName("forward:/customers.html");
        registry.addViewController("/payments").setViewName("forward:/payments.html");
        registry.addViewController("/suppliers").setViewName("forward:/suppliers.html");
        registry.addViewController("/deliveries").setViewName("forward:/deliveries.html");
        registry.addViewController("/analytics").setViewName("forward:/analytics.html");
        registry.addViewController("/settings").setViewName("forward:/settings.html");
        registry.addViewController("/role-management").setViewName("forward:/role-management.html");
        registry.addViewController("/connection-test").setViewName("forward:/connection-test.html");
        registry.addViewController("/users").setViewName("forward:/users.html");
        registry.addViewController("/employees").setViewName("forward:/employees.html");
    }
}
