package com.imilearn.websocket;

import com.imilearn.security.JwtService;
import com.imilearn.security.UserDetailsServiceImpl;
import io.jsonwebtoken.JwtException;
import java.security.Principal;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Resolves the WebSocket session's Principal from a JWT passed as a query parameter during the
 * initial HTTP handshake. This is what actually populates Spring's SimpUserRegistry, which
 * SimpMessagingTemplate#convertAndSendToUser relies on to find a user's active sessions -
 * setting the user only on the STOMP CONNECT frame (via a ChannelInterceptor) is not enough for
 * that registry to see it, even though the CONNECT itself appears to succeed.
 */
@Component
@RequiredArgsConstructor
public class JwtHandshakeHandler extends DefaultHandshakeHandler {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler,
            Map<String, Object> attributes) {
        String token = UriComponentsBuilder.fromUri(request.getURI()).build().getQueryParams().getFirst("token");
        if (token == null) {
            return null;
        }

        try {
            String username = jwtService.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (!jwtService.isTokenValid(token, userDetails)) {
                return null;
            }
            return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        } catch (JwtException | IllegalArgumentException | UsernameNotFoundException exception) {
            return null;
        }
    }
}
