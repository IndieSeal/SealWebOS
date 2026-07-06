export function lerp(currentPosition, targetPosition, value) {
  return (1 - value) * currentPosition + value * targetPosition;
}

export function abs(value) {
    if(value < 0) return value * -1;
    else return value;
}

export function clamp(min, max, value){
    return Math.max(min, Math.min(value, max));
}

export function pingpong(min, max, value){
    if(value >= min && value <= max) return value;

    if(value > max){
        let excess = value - max;
        let newVal = min + excess;
        return newVal;
    }
    else{
        let excess = min - value;
        return max - excess;
    }
}