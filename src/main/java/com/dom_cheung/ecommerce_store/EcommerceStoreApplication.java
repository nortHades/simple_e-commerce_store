package com.dom_cheung.ecommerce_store;

import com.dom_cheung.ecommerce_store.model.User;
import com.dom_cheung.ecommerce_store.repository.UserRepository;
import io.github.cdimascio.dotenv.Dotenv; //
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@SpringBootApplication
public class EcommerceStoreApplication {

	public static void main(String[] args) {

		Dotenv dotenv = null;
		try {
			dotenv = Dotenv.configure()
					.ignoreIfMissing()
					.load();
		} catch (Exception e) {
			System.err.println("Error during Dotenv configuration or loading: " + e.getMessage());
		}

		if (dotenv != null) {
			String cloudinaryUrlFromDotenv = dotenv.get("CLOUDINARY_URL");
			if (cloudinaryUrlFromDotenv != null && !cloudinaryUrlFromDotenv.isEmpty()) {
				System.setProperty("CLOUDINARY_URL", cloudinaryUrlFromDotenv);
				System.out.println("CLOUDINARY_URL system property set from .env file: " + cloudinaryUrlFromDotenv);
			} else {
				System.out.println(".env file was loaded (or ignored if missing), but CLOUDINARY_URL was not found or is empty in it.");
			}
		} else {
			System.out.println("Dotenv instance could not be initialized. CLOUDINARY_URL from .env will not be available as a system property through this mechanism.");
		}

		System.out.println("!!!!!!!!!! RUNNING DEPLOYMENT MARKER: V_OFFICIAL_CLD_SETUP_FINAL !!!!!!!!!!");

		SpringApplication.run(EcommerceStoreApplication.class, args);
	}

	// for test
	// if already have one account, this scope can be removed
	@Bean
	CommandLineRunner initAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			String adminUsername = "admin";
			// check the existence of admin
			if (userRepository.findByUsername(adminUsername).isEmpty()) {
				User adminUser = new User();
				adminUser.setUsername(adminUsername);
				//makesure to use a strong password
				adminUser.setPassword(passwordEncoder.encode("adminpassword"));
				adminUser.setRoles(Set.of("ROLE_ADMIN", "ROLE_USER"));
				adminUser.setEnabled(true);
				userRepository.save(adminUser);
				System.out.println(">>>> Created admin user: " + adminUsername + " with default password (change it!) <<<<");
			} else {
				System.out.println(">>>> Admin user '" + adminUsername + "' already exists. <<<<");
			}
		};
	}
}
