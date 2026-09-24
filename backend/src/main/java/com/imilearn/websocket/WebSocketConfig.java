package com.imilearn.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtHandshakeChannelInterceptor jwtHandshakeChannelInterceptor;
    private final JwtHandshakeHandler jwtHandshakeHandler;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // The frontend dev server (Vite, :5173) proxies /ws through to this backend (:8080),
        // but the browser's Origin header still reflects :5173, which Spring's SockJS/WebSocket
        // origin check rejects by default (403 on the raw "websocket" transport handshake,
        // silently degrading to a less reliable HTTP transport). Allow any origin here since
        // this endpoint is already authenticated per-connection.
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").setHandshakeHandler(jwtHandshakeHandler)
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // "/queue" must be registered too: per-user destinations (e.g. /user/queue/notifications,
        // used by SimpMessagingTemplate#convertAndSendToUser) are translated internally to a
        // literal /queue/... destination per session. Without /queue enabled here, the simple
        // broker doesn't recognize that destination at all and silently drops the message after
        // translation - only "/topic" broadcasts (like forum replies) were ever delivered.
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(jwtHandshakeChannelInterceptor);
    }

    @Bean
    @Order(1)
    SecurityFilterChain webSocketSecurityFilterChain(HttpSecurity http) throws Exception {
        return http.securityMatcher("/ws", "/ws/**").csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll()).build();
    }
}
