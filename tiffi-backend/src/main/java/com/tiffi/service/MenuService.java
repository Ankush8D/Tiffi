package com.tiffi.service;

import com.tiffi.entity.Menu;
import com.tiffi.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository menuRepository;

    public Map<String, Object> getTodayMenu(Long ownerId) {
        List<Menu> menus = menuRepository.findByOwnerIdAndDate(ownerId, LocalDate.now());
        Map<String, Object> result = new HashMap<>();
        result.put("date", LocalDate.now().toString());
        result.put("lunch", null);
        result.put("dinner", null);
        for (Menu m : menus) {
            if (m.getMealType() == Menu.MealType.lunch) result.put("lunch", m.getDescription());
            else result.put("dinner", m.getDescription());
        }
        return result;
    }

    @Transactional
    public Map<String, Object> setMenu(Long ownerId, String mealType, String description) {
        Menu.MealType type = Menu.MealType.valueOf(mealType.toLowerCase());
        Menu menu = menuRepository
                .findByOwnerIdAndDateAndMealType(ownerId, LocalDate.now(), type)
                .orElse(Menu.builder().ownerId(ownerId).date(LocalDate.now()).mealType(type).isDeleted(false).build());
        menu.setDescription(description);
        menuRepository.save(menu);
        return getTodayMenu(ownerId);
    }
}
