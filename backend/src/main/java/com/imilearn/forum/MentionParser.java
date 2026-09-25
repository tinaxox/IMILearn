package com.imilearn.forum;

import com.imilearn.user.User;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class MentionParser {

    private MentionParser() {
    }

    public static List<User> findMentioned(String body, Collection<User> candidates, User exclude) {
        if (body == null || body.isEmpty() || candidates == null || candidates.isEmpty()) {
            return List.of();
        }

        Long excludedId = exclude == null ? null : exclude.getId();
        Map<String, List<User>> usersByFullName = new LinkedHashMap<>();
        for (User candidate : candidates) {
            if (candidate == null || (excludedId != null && excludedId.equals(candidate.getId()))) {
                continue;
            }

            String fullName = (candidate.getName() + " " + candidate.getSurname()).strip();
            if (!fullName.isEmpty()) {
                usersByFullName.computeIfAbsent(fullName, ignored -> new ArrayList<>()).add(candidate);
            }
        }

        List<String> names = usersByFullName.keySet().stream()
                .sorted(Comparator.comparingInt(String::length).reversed())
                .toList();
        Map<Long, User> matchedById = new LinkedHashMap<>();

        for (int index = 0; index < body.length(); index++) {
            if (body.charAt(index) != '@' || hasLetterOrDigitBefore(body, index)) {
                continue;
            }

            int nameStart = index + 1;
            for (String name : names) {
                int nameEnd = nameStart + name.length();
                if (nameEnd <= body.length()
                        && body.startsWith(name, nameStart)
                        && !hasLetterOrDigitAt(body, nameEnd)) {
                    for (User user : usersByFullName.get(name)) {
                        matchedById.putIfAbsent(user.getId(), user);
                    }
                    break;
                }
            }
        }

        return List.copyOf(matchedById.values());
    }

    private static boolean hasLetterOrDigitBefore(String value, int index) {
        return index > 0 && isLetterOrNumber(value.codePointBefore(index));
    }

    private static boolean hasLetterOrDigitAt(String value, int index) {
        return index < value.length() && isLetterOrNumber(value.codePointAt(index));
    }

    private static boolean isLetterOrNumber(int codePoint) {
        int type = Character.getType(codePoint);
        return Character.isLetter(codePoint)
                || type == Character.DECIMAL_DIGIT_NUMBER
                || type == Character.LETTER_NUMBER
                || type == Character.OTHER_NUMBER;
    }
}
